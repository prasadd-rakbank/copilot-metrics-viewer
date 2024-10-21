interface SeatBreakdown {
  total: number;
  added_this_cycle: number;
  pending_cancellation: number;
  pending_invitation: number;
  active_this_cycle: number;
  inactive_this_cycle: number;
}

interface CopilotOrganizationDetailsProps {
  seat_breakdown: SeatBreakdown;
  public_code_suggestions: 'allow' | 'block' | 'unconfigured' | 'unknown';
  ide_chat?: 'enabled' | 'disabled' | 'unconfigured';
  platform_chat?: 'enabled' | 'disabled' | 'unconfigured';
  cli?: 'enabled' | 'disabled' | 'unconfigured';
  seat_management_setting:
    | 'assign_all'
    | 'assign_selected'
    | 'disabled'
    | 'unconfigured';
  plan_type?: 'business' | 'enterprise' | 'unknown';
  [key: string]: any; // For additional properties
}

class CopilotOrganizationDetails {
  seat_breakdown: SeatBreakdown;
  public_code_suggestions: 'allow' | 'block' | 'unconfigured' | 'unknown';
  ide_chat?: 'enabled' | 'disabled' | 'unconfigured';
  platform_chat?: 'enabled' | 'disabled' | 'unconfigured';
  cli?: 'enabled' | 'disabled' | 'unconfigured';
  seat_management_setting:
    | 'assign_all'
    | 'assign_selected'
    | 'disabled'
    | 'unconfigured';
  plan_type?: 'business' | 'enterprise' | 'unknown';
  [key: string]: any; // For additional properties

  constructor({
    seat_breakdown,
    public_code_suggestions,
    ide_chat,
    platform_chat,
    cli,
    seat_management_setting,
    plan_type,
    ...additionalProperties
  }: CopilotOrganizationDetailsProps) {
    this.seat_breakdown = seat_breakdown;
    this.public_code_suggestions = public_code_suggestions;
    this.ide_chat = ide_chat;
    this.platform_chat = platform_chat;
    this.cli = cli;
    this.seat_management_setting = seat_management_setting;
    this.plan_type = plan_type;

    // Assign additional properties
    Object.assign(this, additionalProperties);
  }
}
