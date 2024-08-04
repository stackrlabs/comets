import { DA, DA_NAME } from "@/lib/constants";

interface DAImageProps {
  da: DA;
  width?: number;
  height?: number;
}

export const DAImage = (props: DAImageProps) => {
  const { da, width = 20, height = 20 } = props;
  return (
    <img
      className="rounded-full"
      src={`https://assets.stackrlabs.xyz/${da}.png`}
      alt={DA_NAME[da]}
      width={width}
      height={height}
    />
  );
};
