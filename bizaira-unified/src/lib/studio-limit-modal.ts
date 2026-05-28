export const openStudioLimitModal = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-studio-limit-modal"));
  }
};
