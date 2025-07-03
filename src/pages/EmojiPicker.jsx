import Picker from '@emoji-mart/react';

function EmojiPicker({ onSelect }) {
  return (
    <Picker
      onEmojiSelect={onSelect}  // This is crucial!
    />
  );
}