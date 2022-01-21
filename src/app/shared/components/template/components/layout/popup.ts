import { Component, Input } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { FlowTypes, ITemplateContainerProps } from "../../models";
import { TemplateContainerComponent } from "../../template-container.component";

@Component({
  template: `
    <div
      class="popup-backdrop"
      (click)="dismissOnBackdrop($event)"
      [attr.data-fullscreen]="props.fullscreen ? true : null"
    >
      <div class="popup-content" [attr.data-fullscreen]="props.fullscreen ? true : null">
        <ion-button
          (click)="dismiss()"
          class="close-button"
          fill="clear"
          *ngIf="props.showCloseButton"
        >
          <ion-icon slot="icon-only" name="close"></ion-icon>
        </ion-button>
        <plh-template-container
          class="template-container"
          [name]="props.name"
          [templatename]="props.templatename"
          [parent]="props.parent"
          [row]="props.row"
          (emittedValue)="handleEmittedValue($event)"
        ></plh-template-container>
      </div>
    </div>
  `,
  styles: [
    `
      .popup-backdrop {
        height: 100vh;
        width: 100%;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .popup-backdrop[data-fullscreen] {
        background: white;
      }

      .popup-content {
        margin: 30px;
        max-height: calc(100vh - 60px);
        background: white;
        border-radius: 20px;
        padding: 20px;
        overflow: auto;
      }
      .popup-content[data-fullscreen] {
        width: 100%;
        height: 100%;
        max-height: 100%;
        border-radius: 0;
        margin: 0;
      }
      .popup-content::-webkit-scrollbar {
        display: none;
      }
      .close-button {
        position: sticky;
        height: 40px;
        width: calc(100% + 20px);
        margin-left: -10px;
        top: -20px;
        margin-top: -30px;
        right: 0;
        z-index: 3;
        background: white;
      }
      ion-button::part(native) {
        font-size: 16px;
        width: 70px;
        height: 20px;
        position: absolute;
        right: -20px;
        top: 10px;
      }
    `,
  ],
})
/**
 * When opening a template as a popup, provide a minimal interface and load
 * the template directly as a regular template-container element
 */
export class TemplatePopupComponent {
  @Input() props: ITemplatePopupComponentProps;

  constructor(private modalCtrl: ModalController) {}

  /**
   * When templates emit completed/uncompleted value from standalone popup close the popup
   * NOTE - we do not want to respond to non-standalone templates as this is done through template nav-actions
   * */
  handleEmittedValue(value: { emit_value: string; emit_data: any }) {
    const { emit_value } = value;
    if (this.props.dismissOnEmit) {
      if (["completed", "uncompleted"].includes(emit_value)) {
        this.dismiss(value);
      }
    }
  }

  dismissOnBackdrop(e: MouseEvent) {
    const el = e.target as HTMLElement;
    if (el.classList.contains("popup-backdrop")) {
      this.dismiss();
    }
  }

  dismiss(value?: { emit_value: string; emit_data: any }) {
    this.modalCtrl.dismiss(value);
  }
}

export interface ITemplatePopupComponentProps extends ITemplateContainerProps {
  name: string;
  templatename: string;
  parent?: TemplateContainerComponent;
  row?: FlowTypes.TemplateRow;
  showCloseButton?: boolean;
  dismissOnEmit?: boolean;
  fullscreen?: boolean;
}
