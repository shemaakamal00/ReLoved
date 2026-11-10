import { conditionClass } from "../../utils/conditions";

function ConditionBadge({ condition }: { condition: string }) {
  return (
    <span className={`condition-badge ${conditionClass(condition)}`}>
      <span className="ring"></span>
      {condition}
    </span>
  );
}

export default ConditionBadge;
