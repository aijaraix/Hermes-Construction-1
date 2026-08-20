import { AgentMessage, RoomScope } from '../src/types/hermes';
import { OrganizationEngine } from './organizationEngine';

export class RoomCoordinationEngine {
  private static activeRoomScopes: Map<string, RoomScope> = new Map();

  public static initialize(): void {
    if (this.activeRoomScopes.has('ROOM-204')) return;

    const room204: RoomScope = {
      id: 'ROOM-204',
      name: 'Second Floor Office / Bedroom 204',
      floor: 2,
      areaSqFt: 220,
      ceilingHeightFt: 9.0,
      requiredTrades: ['Architecture', 'Structure', 'Electrical', 'HVAC', 'Plumbing', 'Fire Protection'],
      componentsAssigned: ['WALL-204-N', 'WALL-204-E', 'E-204-01', 'E-204-07', 'H-204-01', 'H-204-02', 'LIGHT-204-01'],
      electricalChain: {
        receptacleIds: ['E-204-01', 'E-204-02', 'E-204-07'],
        circuitId: 'BC-204-01 (20A 120V AFCI/GFCI)',
        panelId: 'PANEL-A (200A 120/240V Main Distribution)',
        feederId: 'FDR-01 (4/0 AWG Aluminum Feeder)',
        serviceId: 'UTIL-SERVICE-200A (TECO Underground Service)'
      },
      hvacChain: {
        diffuserIds: ['H-204-01 (Supply 120 CFM)', 'H-204-02 (Return 120 CFM)'],
        branchDuctId: 'BRD-204 (R-6 8-Inch Flex Duct)',
        trunkDuctId: 'TRK-L02 (14x10 Sheet Metal Trunk)',
        equipmentId: 'AHU-01 (Carrier 3-Ton Variable Speed Air Handler)'
      }
    };

    this.activeRoomScopes.set('ROOM-204', room204);
  }

  public static getRoomScope(roomId: string): RoomScope | undefined {
    this.initialize();
    return this.activeRoomScopes.get(roomId);
  }

  public static executeRoomCoordinationCycle(roomId: string): {
    room: RoomScope;
    consultationMessage: AgentMessage;
    resolutionReason: string;
  } {
    this.initialize();
    const room = this.activeRoomScopes.get(roomId) || this.activeRoomScopes.get('ROOM-204')!;

    // Post consultation request from Room Manager 204 to HVAC Specialist
    const msg = OrganizationEngine.postMessage({
      projectId: 'RESIDENCE-TAMPA-001',
      senderRoleId: 'ROOM-MANAGER-204',
      receiverRoleId: 'HVAC-SUPPLY-RETURN-DIFFUSER-AGENT',
      messageType: 'CONSULTATION_REQUEST',
      scope: roomId,
      componentIds: ['E-204-07', 'H-204-02'],
      payload: {
        issue: 'Clash detected between electrical receptacle E-204-07 and proposed return air grille H-204-02 on North Wall.',
        proposedShiftInches: 18,
        direction: 'EAST'
      },
      reasoning: 'Receptacle E-204-07 requires 12-inch clear wall zone for desk power access. Shifting return grille H-204-02 18 inches east preserves ergonomics and airflow throw.',
      priority: 'HIGH',
      responseRequired: true
    });

    // Resolve message with HVAC Acceptance
    OrganizationEngine.resolveMessage(msg.messageId, {
      status: 'ACCEPT',
      revisedCoordinates: [13.5, 8.0, 1.2],
      hvacThrowImpact: 'Airflow throw remains within 50 FPM comfort zone; pressure drop unchanged (0.02 in. w.g. NC-25 rating).'
    });

    return {
      room,
      consultationMessage: msg,
      resolutionReason: 'Spatial conflict resolved: H-204-02 shifted 18 in. East. Receptacle E-204-07 desk power access preserved with 100% systemic continuity.'
    };
  }
}
