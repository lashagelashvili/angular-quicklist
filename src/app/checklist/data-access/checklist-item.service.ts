import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Subject, map, merge } from 'rxjs';
import {
  AddChecklistItem,
  ChecklistItem,
  EditChecklistItem,
  RemoveChecklistItem,
} from '../../shared/interfaces/checklist-item';
import { StorageService } from '../../shared/data-access/storage.service';
import { RemoveChecklist } from '../../shared/interfaces/checklist';
import { connect } from 'ngxtension/connect';

export interface ChecklistItemsState {
  checklistItems: ChecklistItem[];
  loaded: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ChecklistItemService {
  private storageService = inject(StorageService);

  // state
  private state = signal<ChecklistItemsState>({
    checklistItems: [],
    loaded: false,
  });

  // selectors
  checklistItems = computed(() => this.state().checklistItems);
  loaded = computed(() => this.state().loaded);

  // sources
  add$ = new Subject<AddChecklistItem>();
  toggle$ = new Subject<RemoveChecklistItem>();
  reset$ = new Subject<RemoveChecklistItem>();
  remove$ = new Subject<RemoveChecklistItem>();
  edit$ = new Subject<EditChecklistItem>();
  checklistRemoved$ = new Subject<RemoveChecklist>();

  private checklistItemsLoaded$ = this.storageService.loadChecklistItems();

  constructor() {
    const nextState$ = merge(
      this.checklistItemsLoaded$.pipe(
        map((checklistItems) => ({ checklistItems, loaded: true }))
      )
    );

    connect(this.state)
      .with(nextState$)
      .with(this.add$, (state, checklistItem) => ({
        checklistItems: [
          ...state.checklistItems,
          {
            ...checklistItem.item,
            id: Date.now().toString(),
            checklistId: checklistItem.checklistId,
            checked: false,
          },
        ],
      }))
      .with(this.toggle$, (state, checklistItemId) => ({
        checklistItems: state.checklistItems.map((item) =>
          item.id === checklistItemId
            ? { ...item, checked: !item.checked }
            : item
        ),
      }))
      .with(this.reset$, (state, checklistId) => ({
        checklistItems: state.checklistItems.map((item) =>
          item.checklistId === checklistId ? { ...item, checked: false } : item
        ),
      }))

      .with(this.edit$, (state, checkListItem) => ({
        checklistItems: state.checklistItems.map((item) =>
          item.id === checkListItem.id
            ? { ...item, title: checkListItem.data.title }
            : item
        ),
      }))

      .with(this.remove$, (state, id) => ({
        checklistItems: state.checklistItems.filter((item) => item.id !== id),
      }))

      .with(this.checklistRemoved$, (state, checklistId) => ({
        checklistItems: state.checklistItems.filter(
          (item) => item.checklistId !== checklistId
        ),
      }));

    effect(() => {
      if (this.loaded()) {
        this.storageService.saveChecklistItems(this.checklistItems());
      }
    });
  }
}
