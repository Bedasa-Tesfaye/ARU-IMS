import React from 'react';
import './Modal.css';

const Modal = ({ open, size = 'md', title, onClose, children, footer }) => {
  if (!open) return null;

  return (
    <div className="examiner-modal-overlay" onClick={onClose} role="presentation">
      <div className={`examiner-modal ${size}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header className="examiner-modal-header">
          <h3>{title}</h3>
          <button type="button" onClick={onClose} className="examiner-icon-btn">✖</button>
        </header>
        <div className="examiner-modal-body">{children}</div>
        {footer && <footer className="examiner-modal-footer">{footer}</footer>}
      </div>
    </div>
  );
};

export default Modal;
