// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

import {
  nbformat
} from '@jupyterlab/coreutils';

import {
  IRenderMimeRegistry, IRenderMime
} from '@jupyterlab/rendermime';

import {
  Widget, Panel
} from '@phosphor/widgets';

import {
  RenderableDiffView, isBase64, DATA_IS_BASE64_CLASS
} from './renderable';

import {
  AttachmentDiffModel
} from '../model';


const ATTACHMENT_CLASS = 'jp-Diff-attachment';
const DIMENSION_CHANGED_CLASS = 'jp-Diff-dimensionChanged';
const WIDTH_LARGEST_CLASS = 'mod-width-largest';
const HEIGHT_LARGEST_CLASS = 'mod-height-largest';

/**
 * Widget for outputs with renderable MIME data.
 */
export
class AttachmentView extends RenderableDiffView<nbformat.IMimeBundle> {
  constructor(model: AttachmentDiffModel,
              editorClass: string[],
              rendermime: IRenderMimeRegistry,
              mimetype: string) {
    super(model, editorClass, rendermime, mimetype);
    AttachmentView.metaImages(this);
  }

  /**
   * Checks if cell attachemnts can be rendered (either safe or
   * sanitizable)
   */
  static canRender(model: AttachmentDiffModel, rendermime: IRenderMimeRegistry): boolean {
    let toTest: nbformat.IMimeBundle[] = model.contents;
    for (let bundle of toTest) {
      let mimetype = rendermime.preferredMimeType(bundle, model.trusted);
      if (!mimetype) {
        return false;
      }
    }
    return true;
  }

  protected static metaImages(widget: Widget) {
    let images = widget.node.querySelectorAll('.jp-RenderedImage img') as NodeListOf<HTMLImageElement>;
    let widthChanged = false;
    let heightChanged = false;
    if (images.length === 2) {
      let i0 = images.item(0);
      let i1 = images.item(1);
      if (i0.naturalWidth !== i1.naturalWidth) {
        widthChanged = true;
      }
      if (i0.naturalHeight !== i1.naturalHeight) {
        heightChanged = true;
      }
    }
    for (let j=0; j < images.length; ++j) {
      let img = images.item(j);
      let label = document.createElement('div');
      let meta = '<strong>W:</strong> ';
      if (widthChanged) {
        meta += '<span class="' + DIMENSION_CHANGED_CLASS + '">' + img.naturalWidth + 'px' + '</span>';
      } else {
        meta += img.naturalWidth + 'px';
      }
      meta += ' | <strong>H:</strong> ';
      if (heightChanged) {
        meta += '<span class="' + DIMENSION_CHANGED_CLASS + '">' + img.naturalHeight + 'px' + '</span>';
      } else {
        meta += img.naturalHeight + 'px';
      }
      if (img.naturalWidth < img.naturalHeight) {
        img.classList.add(HEIGHT_LARGEST_CLASS);
      } else {
        img.classList.add(WIDTH_LARGEST_CLASS);
      }
      label.innerHTML = meta;
      img.parentNode!.appendChild(label);
    }
  }

  /**
   * Create a widget which renders the given cell output
   */
  protected createSubView(bundle: nbformat.IMimeBundle, trusted: boolean): Widget {
    let panel = new RenderedAttachmentWidget(this.rendermime);
    panel.updateView(bundle, trusted, this.mimetype);
    return panel;
  }

  _sanitized: boolean;
  _rendermime: IRenderMimeRegistry;
}


class RenderedAttachmentWidget extends Panel {

  /**
   *
   */
  constructor(rendermime: IRenderMimeRegistry) {
    super();
    this.rendermime = rendermime;
  }

  updateView(bundle: nbformat.IMimeBundle, trusted: boolean, mimetype: string) {
    let old = this.renderer;
    this.renderer = this.createRenderer(bundle, trusted, mimetype);
    if (old !== undefined) {
      old.dispose();
    }
    this.addWidget(this.renderer);
  }

  protected createRenderer(bundle: nbformat.IMimeBundle, trusted: boolean, mimetype: string): IRenderMime.IRenderer {
    let widget = this.rendermime.createRenderer(mimetype);
    widget.renderModel(model);
    widget.addClass(ATTACHMENT_CLASS);
    if (isBase64(bundle[mimetype] as string)) {
      widget.addClass(DATA_IS_BASE64_CLASS);
    }
    return widget;
  }

  protected renderer: IRenderMime.IRenderer | undefined;

  protected rendermime: IRenderMimeRegistry;
}
