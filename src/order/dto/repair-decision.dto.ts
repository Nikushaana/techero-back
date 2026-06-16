import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum RepairDecision {
    APPROVE = 'approve',
    CANCEL = 'cancel',
}

export class RepairDecisionDto {
    @IsEnum(RepairDecision)
    decision!: RepairDecision;

    @IsOptional()
    @IsString()
    reason?: string;

}
