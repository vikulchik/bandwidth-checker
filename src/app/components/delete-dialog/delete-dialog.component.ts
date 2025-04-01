import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-dialog',
  template: `
    <div class="delete-dialog">
      <div class="dialog-header">
        <div class="warning-icon">
          <svg
            width="30"
            height="30"
            viewBox="0 0 32 33"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 9.83333V16.5M16 23.1667H16.0167M31 16.5C31 18.4698 30.612 20.4204 29.8582 22.2403C29.1044 24.0601 27.9995 25.7137 26.6066 27.1066C25.2137 28.4995 23.5601 29.6044 21.7403 30.3582C19.9204 31.112 17.9698 31.5 16 31.5C14.0302 31.5 12.0796 31.112 10.2597 30.3582C8.43986 29.6044 6.78628 28.4995 5.3934 27.1066C4.00052 25.7137 2.89563 24.0601 2.14181 22.2403C1.38799 20.4204 1 18.4698 1 16.5C1 12.5218 2.58035 8.70644 5.3934 5.8934C8.20644 3.08035 12.0218 1.5 16 1.5C19.9782 1.5 23.7936 3.08035 26.6066 5.8934C29.4196 8.70644 31 12.5218 31 16.5Z"
              stroke="#E53F28"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h2>Delete this video?</h2>
      </div>

      <div class="dialog-content">
        <p>Are you sure you want to delete this video? This action cannot be undone.</p>
      </div>

      <div class="dialog-actions">
        <button class="cancel-button" (click)="onCancel()">Cancel</button>
        <button class="delete-button" (click)="onConfirm()">Delete video</button>
      </div>
    </div>
  `,
  styles: [
    `
      .delete-dialog {
        padding: 24px;
        max-width: 400px;
      }

      .dialog-header {
        text-align: center;
        margin-bottom: 16px;
      }

      .warning-icon {
        margin-bottom: 13px;
      }

      h2 {
        margin: 0;
        font-size: 16px;
        font-weight: 700;
        color: #292830;
      }

      .dialog-content {
        text-align: center;
        margin-bottom: 24px;
      }

      p {
        margin: 0;
        color: #5b5c6a;
        font-size: 14px;
      }

      .dialog-actions {
        display: flex;
        gap: 16px;
      }

      button {
        flex: 1;
        padding: 11px;
        border-radius: 8px;
        border: none;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .cancel-button {
        background: transparent;
        border: 1px solid #5061d0;
        color: #5061d0;
      }

      .cancel-button:hover {
        background: #5061d0;
        color: white;
      }

      .delete-button {
        background: #e53f28;
        color: white;
      }

      .delete-button:hover {
        background: #ff7875;
      }
    `,
  ],
})
export class DeleteDialogComponent {
  constructor(public dialogRef: MatDialogRef<DeleteDialogComponent>) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
