import { ArrowUpRight, X } from "lucide-react";
export function HelpDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={() => onClose()}>
      <section
        className="help-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
      >
        <button
          autoFocus
          className="icon-button close-help"
          aria-label="Close help"
          onClick={() => onClose()}
        >
          <X size={20} />
        </button>
        <span className="eyebrow">A QUICK GUIDE</span>
        <h2 id="help-title">A little circle. A lot to discover.</h2>
        <p>
          Each point represents one of the twelve semitones. The polygon
          connects the notes in your selected scale; the larger point marks its
          tonic, or home note.
        </p>
        <p>
          <strong>Rotate.</strong> Drag the circle or focus it and use the arrow
          keys. Each step changes the key by one semitone, preserving the
          scale’s interval pattern.
        </p>
        <p>
          <strong>Explore.</strong> Choose a key and scale below the circle. The
          sharp / flat switch changes pitch-class labels to their enharmonic
          equivalents.
        </p>
        <p>
          <strong>Listen.</strong> Play one ascending scale cycle with your
          selected instrument and note duration in the C4–B5 register: begin at
          the selected tonic and stop when that tonic returns an octave higher.
          The highlighted point follows each sound.
        </p>
        <button className="play-button" onClick={() => onClose()}>
          Let’s explore <ArrowUpRight size={16} />
        </button>
      </section>
    </div>
  );
}
