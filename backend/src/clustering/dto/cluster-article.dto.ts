import { IsIn, IsOptional, IsString } from 'class-validator';
import { LINK_DECISION_VALUES, LinkDecisionValue } from '../../common/pipeline.constants';

export class ClusterArticleDto {
  @IsOptional()
  @IsIn(LINK_DECISION_VALUES)
  overrideDecision?: LinkDecisionValue;

  @IsOptional()
  @IsString()
  rationale?: string;
}
