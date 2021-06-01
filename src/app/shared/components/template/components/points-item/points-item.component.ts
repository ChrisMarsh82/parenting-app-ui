import {
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { TemplateBaseComponent } from "../base";
import { FlowTypes, ITemplateRowProps } from "../../models";
import { getStringParamFromTemplateRow } from "../../../../utils";
import { AnimationOptions } from "ngx-lottie";
import player from "lottie-web";
import { getImageAssetPath } from "../../utils/template-utils";

@Component({
  selector: "plh-points-item",
  templateUrl: "./points-item.component.html",
  styleUrls: ["./points-item.component.scss"],
})
export class TmplParentPointBoxComponent
  extends TemplateBaseComponent
  implements ITemplateRowProps, OnInit {
  @Input() template: FlowTypes.Template;
  @Input() localVariables: { [name: string]: any };
  @ViewChild("star", { static: false }) star: ElementRef;
  @ViewChild("item", { static: false }) item: ElementRef;
  icon_src: string | null;
  lottie_src: string | null;
  windowWidth: number;
  scaleFactor: number = 1;
  text: string | null;
  wasClicked: boolean = false;
  value: number | null = 0;
  animOptions: AnimationOptions;
  @HostListener("window:resize", ["$event"]) onResize(event) {
    this.windowWidth = event.target.innerWidth - 10;
    this.getScaleFactor();
  }

  @HostBinding("style.--scale-factor--point") get scale() {
    return this.scaleFactor;
  }
  constructor() {
    super();
  }

  ngOnInit() {
    this.getParams();
    this.getScaleFactor();
    if (this.lottie_src) {
      this.lottie_src = getImageAssetPath(this.lottie_src);
      this.animOptions = this.setAnimOptions(this.lottie_src, this.text, false);
    }
  }

  getParams() {
    this.icon_src = getStringParamFromTemplateRow(this._row, "icon_src", null);
    this.lottie_src = getStringParamFromTemplateRow(this._row, "lottie_src", null);
    this.text = getStringParamFromTemplateRow(this._row, "text", null);
    this.windowWidth = window.innerWidth - 10;
    if (!this._row.value) {
      this._row.value = 0;
    }
  }

  async clickPointItem() {
    if (this._row.disabled) {
      return;
    }
    this._row.value = parseInt(this._row.value) + 1;
    this.value = this._row.value;
    this.star.nativeElement.classList.add("on-add");
    setTimeout((_) => {
      this.star.nativeElement.classList.remove("on-add");
    }, 1000);
    if (!this.wasClicked) {
      this.item.nativeElement.classList.add("complete");
    }
    this.wasClicked = true;
    await this.setValue(`${this.value}`);
    await this.triggerActions("click");
    await this.triggerActions("changed");
    if (this.lottie_src) {
      player.play(this.animOptions.name);
    }
  }

  private setAnimOptions(path: string, name: string, autoplay: boolean): AnimationOptions {
    const animOptions = { path, name, autoplay };
    return animOptions;
  }

  getScaleFactor(): number {
    this.scaleFactor = this.windowWidth / 420 > 1 ? 1 : this.windowWidth / ((200 + 20) * 2);
    return this.scaleFactor;
  }
}
