
import { FlagForgeClient, FlagForgeConfig, EvaluationResult } from './FlagForgeClient';

export { FlagForgeClient, FlagForgeConfig, EvaluationResult };

export function init(config: FlagForgeConfig): FlagForgeClient {
  return new FlagForgeClient(config);
}
