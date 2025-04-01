import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteDialogComponent } from './delete-dialog.component';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

describe('DeleteDialogComponent', () => {
  let component: DeleteDialogComponent;
  let fixture: ComponentFixture<DeleteDialogComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<DeleteDialogComponent>>;

  beforeEach(async () => {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      declarations: [DeleteDialogComponent],
      imports: [MatButtonModule],
      providers: [{ provide: MatDialogRef, useValue: dialogRef }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close dialog with true when confirmed', () => {
    component.onConfirm();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should close dialog with false when cancelled', () => {
    component.onCancel();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });

  it('should display correct text content', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h2').textContent).toContain('Delete Video');
    expect(compiled.querySelector('p').textContent).toContain(
      'Are you sure you want to delete this video?'
    );
  });

  it('should have correct button labels', () => {
    const compiled = fixture.nativeElement;
    const buttons = compiled.querySelectorAll('button');
    expect(buttons[0].textContent).toContain('Cancel');
    expect(buttons[1].textContent).toContain('Delete');
  });
});
