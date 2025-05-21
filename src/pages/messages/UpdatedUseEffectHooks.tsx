import React, { useEffect } from 'react';

const UpdatedUseEffectHooks = ({ fetchThreads, fetchMessages, selectedThread }) => {
  // Initial fetch with thread selection, no polling
  useEffect(() => {
    fetchThreads(true);
  }, [fetchThreads]);

  // Fetch messages once when selected thread changes, no polling
  useEffect(() => {
    if (!selectedThread) return;
    fetchMessages(true);
  }, [selectedThread, fetchMessages]);

  return null;
};

export default UpdatedUseEffectHooks;
