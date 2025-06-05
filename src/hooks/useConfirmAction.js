export const useConfirmAction = () => {
  const confirmAction = (action, message) => {
    if (window.confirm(message)) {
      action();
    }
  };

  return confirmAction;
}; 