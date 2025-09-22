import { Title, Text } from "./subcomponents/index";
import type { Mode } from "./subcomponents/index";

export type TextCardSaved = {
  title: string;
  description: string;
};

interface TextCardProps {
  mode?: Mode;
  title: string;
  description: string;
  onPatch?: (patch: Partial<TextCardSaved>) => void;
  children?: React.ReactNode;
}

const TextCard: React.FC<TextCardProps> = ({
  mode = "view",
  title,
  description,
  onPatch,
  children,
}) => {
  return (
    <div className="text-card" data-mode={mode}>
      {children}
      {(title.length > 0 || mode === "edit") && (<Title
        mode={mode}
        value={title}
        className="text-card-title"
        maxLength={30}
        onChange={(v) => onPatch?.({ title: v })}
        />
      )}

      <Text
        mode={mode}
        className="text-card-description"
        value={description}
        maxLength={250}
        onChange={(v) => onPatch?.({ description: v })}
      />
    </div>
  );
};

export default TextCard;