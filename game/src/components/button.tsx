interface Props {
  children: React.ReactNode;
  onClick: () => void;
  isDisabled?: boolean;
}

export const Button: React.FC<Props> = ({ children, onClick, isDisabled }) => {
  return (
    <button
      className="select-none p-2 sm:px-2 md:px-3 lg:px-4 border-2 cursor-pointer shadow-sm hover:bg-gray-800 hover:border-gray-400"
      disabled={isDisabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
