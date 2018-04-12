// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

import {
  JSONValue
} from '@phosphor/coreutils';

import {
  PanelLayout, Widget
} from '@phosphor/widgets';

import {
  IRenderMimeRegistry
} from '@jupyterlab/rendermime';

import {
   RenderableDiffModel
} from '../model';



/**
 * Class for outputs which data is base64
 */
export
const DATA_IS_BASE64_CLASS = 'jp-diff-base64Output';



let _base64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
/**
 * Whether a string matches the format of a base64 string of a minimum length.
 *
 * @param data The string to inspect
 * @param minLength The minimum length the data needs to have
 */
export
function isBase64(data: string | null, minLength=64): boolean {
  return data !== null && data.length > minLength && _base64.test(data.replace('\n', ''));
}


/**
 * Widget for outputs with renderable MIME data.
 */
export
abstract class RenderableDiffView<T extends JSONValue> extends Widget {
  constructor(model: RenderableDiffModel<T>, editorClass: string[],
              rendermime: IRenderMimeRegistry, mimetype: string) {
    super();
    this.rendermime = rendermime;
    this.model = model;
    this.mimetype = mimetype;
    let bdata = model.base;
    let rdata = model.remote;
    this.layout = new PanelLayout();

    let ci = 0;
    if (bdata) {
      let widget = this.createSubView(bdata, model.trusted);
      this.layout.addWidget(widget);
      widget.addClass(editorClass[ci++]);
    }
    if (rdata && rdata !== bdata) {
      let widget = this.createSubView(rdata, model.trusted);
      this.layout.addWidget(widget);
      widget.addClass(editorClass[ci++]);
    }
  }

  layout: PanelLayout;

  mimetype: string;

  /**
   * Create a widget which renders the given cell output
   */
  protected abstract createSubView(data: T, trusted: boolean): Widget;

  protected rendermime: IRenderMimeRegistry;

  protected model: RenderableDiffModel<T>;
}
