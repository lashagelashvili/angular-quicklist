import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  ChecklistItem,
  RemoveChecklistItem,
} from '../../shared/interfaces/checklist-item';

@Component({
  standalone: true,
  selector: 'app-checklist-item-list',
  template: `
    <section>
      <ul>
        @for (item of checklistItems; track item.id){
        <li>
          <div>
            @if (item.checked){
            <span>✅</span>
            }
            {{ item.title }}
          </div>
          <div>
            <button (click)="toggle.emit(item.id)">Toggle</button>
            <button (click)="edit.emit(item)">Edit</button>
            <button (click)="delete.emit(item.id)">Delete</button>
          </div>
        </li>
        } @empty {
        <div>
          <h2>Add an item</h2>
          <p>Click the add button to add your first item to this quicklist</p>
        </div>
        }
      </ul>
    </section>
  `,
})
export class ChecklistItemListComponent {
  @Input({ required: true }) checklistItems!: ChecklistItem[];
  @Output() toggle = new EventEmitter<RemoveChecklistItem>();
  @Output() delete = new EventEmitter<RemoveChecklistItem>();
  @Output() edit = new EventEmitter<ChecklistItem>();
}
