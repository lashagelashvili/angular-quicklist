import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ChecklistService } from '../shared/data-access/checklist.service';
import { ChecklistHeaderComponent } from './ui/checklist-header.component';
import { FormBuilder } from '@angular/forms';
import { ChecklistItem } from '../shared/interfaces/checklist-item';
import { ChecklistItemService } from './data-access/checklist-item.service';
import { ModalComponent } from '../shared/ui/modal.component';
import { FormModalComponent } from '../shared/ui/form-modal.component';
import { ChecklistItemListComponent } from './ui/checklist-item-list.component';

@Component({
  standalone: true,
  selector: 'app-checklist',
  template: `
    @if (checklist(); as checklist){
    <app-checklist-header
      [checklist]="checklist"
      (addItem)="checklistItemBeingEdited.set({})"
    />
    <app-checklist-item-list [checklistItems]="items()" />
    }

    <app-modal [isOpen]="!!checklistItemBeingEdited()">
      <ng-template>
        <app-form-modal
          title="Create item"
          [formGroup]="checklistItemForm"
          (save)="checklistItemService.add$.next({
            item: checklistItemForm.getRawValue(),
            checklistId: checklist()?.id!,
          })"
          (close)="checklistItemBeingEdited.set(null)"
        ></app-form-modal>
      </ng-template>
    </app-modal>
  `,
  imports: [
    ChecklistHeaderComponent,
    ModalComponent,
    FormModalComponent,
    ChecklistItemListComponent,
  ],
})
export default class ChecklistComponent {
  checklistService = inject(ChecklistService);
  checklistItemService = inject(ChecklistItemService);
  route = inject(ActivatedRoute);
  formBuilder = inject(FormBuilder);

  checklistItemBeingEdited = signal<Partial<ChecklistItem> | null>(null);

  params = toSignal(this.route.paramMap);

  checklist = computed(() =>
    this.checklistService
      .checklists()
      .find((checklist) => checklist.id === this.params()?.get('id'))
  );

  checklistItemForm = this.formBuilder.nonNullable.group({
    title: [''],
  });

  items = computed(() =>
    this.checklistItemService
      .checklistItems()
      .filter((item) => item.checklistId === this.params()?.get('id'))
  );

  constructor() {
    effect(() => {
      const checklistItem = this.checklistItemBeingEdited();

      if (!checklistItem) {
        this.checklistItemForm.reset();
      }
    });
  }
}
