/* Mature IFC parser adapter. This process receives ONLY service-created temp paths.
 * No source code, network URLs, credential environment or user paths are executed.
 * Raw mesh buffers stay here; output contains fingerprints/references/broadphase bounds.
 */
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const IFC = require('web-ifc');
const version = JSON.parse(fs.readFileSync(path.join(path.dirname(require.resolve('web-ifc')), 'package.json'), 'utf8')).version;
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const list = vector => { const result=[]; for(let i=0;i<vector.size();i++)result.push(vector.get(i)); return result; };
const value = wrapped => wrapped?.value;
const validGuid = id => typeof id==='string' && /^[0-3][0-9A-Za-z_$]{21}$/.test(id);

async function normalize() {
  const [inputPath, outputPath] = process.argv.slice(2);
  const bytes=new Uint8Array(fs.readFileSync(inputPath));
  // Framing check only, not a STEP parser. Semantic parsing is entirely web-ifc.
  const framing=Buffer.from(bytes).toString('utf8');
  if(!framing.trimStart().startsWith('ISO-10303-21;') || !framing.trimEnd().endsWith('END-ISO-10303-21;'))throw new Error('Invalid IFC STEP framing');
  const api=new IFC.IfcAPI(); await api.Init();
  api.SetLogLevel(IFC.LogLevel.LOG_LEVEL_OFF);
  let model;
  try {
    model=api.OpenModel(bytes,{COORDINATE_TO_ORIGIN:false,MEMORY_LIMIT:256*1024*1024});
    if(model<0)throw new Error('web-ifc rejected source model');
    const schema=api.GetModelSchema(model);
    if(!['IFC2X3','IFC4','IFC4X3'].includes(schema))throw new Error('Unsupported or missing IFC schema');
    const ids=list(api.GetAllLines(model));
    if(ids.length>500000)throw new Error('IFC line limit exceeded');
    const lines=new Map(ids.map(id=>[id,api.GetLine(model,id)]));
    const type=line=>api.GetNameFromTypeCode(line.type).toUpperCase();
    if(![...lines.values()].some(line=>type(line)==='IFCPROJECT'))throw new Error('IFC project is missing');
    const warnings=[];
    // Bounded traversal of parsed IFC references, with cycle markers. Preserve unknown fields.
    function expand(item,depth=0,seen=new Set()) {
      if(item===null||item===undefined)return null;
      if(typeof item==='number'&&!Number.isFinite(item))throw new Error('Nonfinite IFC value');
      if(typeof item!=='object')return item;
      if(item.type!==IFC.REF&&typeof item.value==='number'){if(!Number.isFinite(item.value))throw new Error('Nonfinite IFC measure');return {type:item.name??item.type,value:item.value};}
      if(depth>20){ if(!warnings.includes('REFERENCE_DEPTH_LIMIT'))warnings.push('REFERENCE_DEPTH_LIMIT');return {unresolved:'REFERENCE_DEPTH_LIMIT'}; }
      if(Array.isArray(item))return item.map(x=>expand(x,depth+1,seen));
      if(item.type===IFC.REF){
        const id=item.value;
        // web-ifc represents IFC derived (*) fields (e.g. SIUnit.Dimensions) as Handle(0).
        if(id===0)return {derivedOrNullReference:true};
        if(seen.has(id))return {cycleReference:id};
        if(!lines.has(id))throw new Error(`Unresolved IFC reference #${id}`);
        const next=new Set(seen);next.add(id);return expand(lines.get(id),depth+1,next);
      }
      const result={};
      for(const key of Object.keys(item).sort()) {
        if(key==='expressID')continue;
        result[key]=key==='type'&&typeof item[key]==='number'&&item[key]>1000?api.GetNameFromTypeCode(item[key]):expand(item[key],depth+1,seen);
      }
      return result;
    }
    const relationsByEntity=new Map();
    for(const rel of lines.values())if(type(rel).startsWith('IFCREL')) {
      const refs=[...new Set(Object.values(rel).flatMap(x=>Array.isArray(x)?x:[x]).filter(x=>x?.type===IFC.REF).map(x=>x.value))];
      if(refs.some(id=>id>0&&!lines.has(id)))throw new Error('Unresolved IFC relationship endpoint');
      for(const id of refs){const existing=relationsByEntity.get(id)??[];existing.push({rel,refs});relationsByEntity.set(id,existing);}
    }
    const entities=[];
    for(const line of lines.values()) {
      const ifcType=type(line);
      // IfcObject (products, spaces, groups, systems, project) versus relationships/Pset definitions.
      if(!('GlobalId' in line)||ifcType.startsWith('IFCREL')||ifcType==='IFCPROPERTYSET'||ifcType==='IFCELEMENTQUANTITY'||ifcType.endsWith('TYPE'))continue;
      const rawGlobalId=value(line.GlobalId);
      const entity={expressId:line.expressID,ifcType,rawGlobalId,globalId:validGuid(rawGlobalId)?rawGlobalId:undefined,name:value(line.Name),description:value(line.Description),propertySets:[],materials:[],quantities:[],typeProperties:[],relationships:[],placement:expand(line.ObjectPlacement),extensions:expand(line),warnings:[]};
      if(!entity.globalId)entity.warnings.push('INVALID_OR_MISSING_SOURCE_GLOBAL_ID');
      for(const {rel,refs} of relationsByEntity.get(line.expressID)??[]) {
        const kind=type(rel);
        const targets=refs.filter(id=>id!==line.expressID);
        // Compact source relation retains endpoints, avoiding reciprocal graph explosions.
        const source={};for(const key of Object.keys(rel).sort())if(!['expressID','OwnerHistory','GlobalId'].includes(key))source[key]=rel[key];
        source.endpointProperties=targets.map(id=>{const target=lines.get(id);return !target?{unresolvedExpressId:id}:target.GlobalId?{expressId:id,ifcType:type(target),globalId:value(target.GlobalId),name:value(target.Name)}:expand(target);});
        entity.relationships.push({kind,targetExpressIds:targets,source});
        if(kind==='IFCRELDEFINESBYPROPERTIES') {
          const def=lines.get(rel.RelatingPropertyDefinition?.value);
          if(def) { const parsed=expand(def); if(type(def)==='IFCELEMENTQUANTITY')entity.quantities.push({provenance:'IMPORTED_SOURCE_CLAIM',value:parsed}); else entity.propertySets.push(parsed); }
        }
        if(kind==='IFCRELASSOCIATESMATERIAL')entity.materials.push(expand(rel.RelatingMaterial));
        if(kind==='IFCRELDEFINESBYTYPE')entity.typeProperties.push(expand(rel.RelatingType));
      }
      entities.push(entity);
      if(entities.length>100000)throw new Error('IFC entity limit exceeded');
    }
    if(!entities.length)throw new Error('No IFC objects parsed');
    const byId=new Map(entities.map(e=>[e.expressId,e]));
    api.StreamAllMeshes(model,mesh=>{
      const entity=byId.get(mesh.expressID); if(!entity)return;
      const hashes=[],transforms=[],min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
      for(const placed of list(mesh.geometries)) {
        const geo=api.GetGeometry(model,placed.geometryExpressID);
        try {
          const vertices=api.GetVertexArray(geo.GetVertexData(),geo.GetVertexDataSize());
          const indices=api.GetIndexArray(geo.GetIndexData(),geo.GetIndexDataSize());
          const h=crypto.createHash('sha256');h.update(Buffer.from(vertices.buffer,vertices.byteOffset,vertices.byteLength));h.update(Buffer.from(indices.buffer,indices.byteOffset,indices.byteLength));hashes.push(h.digest('hex'));
          const t=placed.flatTransformation;transforms.push(Array.from(t));
          for(let i=0;i<vertices.length;i+=6)for(let k=0;k<3;k++) {
            const p=t[k]*vertices[i]+t[4+k]*vertices[i+1]+t[8+k]*vertices[i+2]+t[12+k];
            if(!Number.isFinite(p))throw new Error('Nonfinite derived geometry');min[k]=Math.min(min[k],p);max[k]=Math.max(max[k],p);
          }
        } finally {geo.delete();}
      }
      if(hashes.length) {
        entity.geometry={fingerprint:hash(hashes),representation:'IFC_DERIVED_REFERENCE',coordinateSystem:'WEB_IFC_RENDER_Y_UP_METERS',meshCount:hashes.length,transforms};
        if(min.every(Number.isFinite))entity.collisionProxy={kind:'AABB_BROADPHASE_ONLY',minMeters:min,maxMeters:max,frame:'WEB_IFC_RENDER_Y_UP_METERS',physicallyVerified:false};
      }
    });
    const stableRef=id=>{const e=byId.get(id);return e?.globalId?{globalId:e.globalId}:e?{expressId:id,ifcType:e.ifcType}:expand(lines.get(id));};
    for(const entity of entities) {
      const rels=entity.relationships.map(r=>({kind:r.kind,targets:r.targetExpressIds.map(stableRef).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))})).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
      entity.fingerprints={properties:hash({name:entity.name,description:entity.description,psets:entity.propertySets,materials:entity.materials,quantities:entity.quantities,types:entity.typeProperties}),placement:hash({placement:entity.placement,meshTransforms:entity.geometry?.transforms}),geometry:entity.geometry?.fingerprint??hash(null),relationships:hash(rels)};
      if(!entity.geometry && lines.get(entity.expressId)?.Representation)entity.warnings.push('NO_DERIVED_MESH_AVAILABLE');
    }
    const sourceUnits=[...lines.values()].filter(l=>type(l)==='IFCUNITASSIGNMENT').map(l=>expand(l));
    const result={schema,parser:{implementation:'web-ifc',version},entities,warnings,sourceUnits};
    const json=JSON.stringify(result);if(Buffer.byteLength(json)>32*1024*1024)throw new Error('Normalized output limit exceeded');
    fs.writeFileSync(outputPath,json,{flag:'wx',mode:0o600});
  } finally {if(model!==undefined&&model>=0)api.CloseModel(model);api.Dispose();}
}
normalize().then(()=>process.exit(0)).catch(error=>{process.send?.({error:String(error.message).slice(0,500)});process.exit(1);});
