// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

import {
  nbformat
} from '@jupyterlab/services';

import {
  IRenderMime
} from 'jupyterlab/lib/rendermime';

import {
  Widget
} from 'phosphor/lib/ui/widget';

import {
  RenderableDiffView
} from './renderable';

import {
  AttachmentDiffModel, convertBundle
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
              rendermime: IRenderMime) {
    super(model, editorClass, rendermime);
    AttachmentView.metaImages(this);
  }

  /**
   * Checks if cell attachemnts can be rendered as untrusted (either safe or
   * sanitizable)
   */
  static canRenderUntrusted(model: AttachmentDiffModel): boolean {
    let toTest: nbformat.IMimeBundle[] = [];
    if (model.base) {
      toTest.push(model.base);
    }
    if (model.remote && model.remote !== model.base) {
      toTest.push(model.remote);
    }
    for (let bundle of toTest) {
      if (!RenderableDiffView.safeOrSanitizable(bundle)) {
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
    let widget = this._rendermime.render({
      bundle: convertBundle(bundle),
      trusted
    });
    widget.addClass(ATTACHMENT_CLASS);
    return widget;
  }

  _sanitized: boolean;
  _rendermime: IRenderMime;
}
