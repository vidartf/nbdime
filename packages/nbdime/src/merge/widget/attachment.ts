// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

import {
  IRenderMime
} from 'jupyterlab/lib/rendermime';

import {
  Widget
} from 'phosphor/lib/ui/widget';

import {
  FlexPanel
} from '../../upstreaming/flexpanel';

import {
  AttachmentDiffModel, convertBundle
} from '../../diff/model';


const ATTACHMENT_CLASS = 'jp-Merge-attachment';
const DIMENSION_CHANGED_CLASS = 'jp-Merge-dimensionChanged';
const WIDTH_LARGEST_CLASS = 'mod-width-largest';
const HEIGHT_LARGEST_CLASS = 'mod-height-largest';

/**
 * Widget for showing side by side comparison and picking of merge outputs
 */
export
class AttachmentMergeView extends FlexPanel {

  /**
   *
   */
  constructor(merged: AttachmentDiffModel,
              classes: string[], rendermime: IRenderMime,
              local?: AttachmentDiffModel | null,
              remote?: AttachmentDiffModel | null,) {
    super();
    this.rendermime = rendermime;

    let widgets: Widget[] = [];
    let row = new FlexPanel({direction: 'left-to-right', evenSizes: true});
    let base = merged.base;
    let basePane: Widget | null = null;
    if (base) {
      basePane = this.makePane(merged, true);
      basePane.addClass(classes[0]);
      AttachmentMergeView.metaImages(basePane);

      if (local !== undefined) {
        let leftPane = this.makePane(local);
        leftPane.addClass(classes[1]);
        row.addWidget(leftPane);
        widgets.push(leftPane);
        AttachmentMergeView.metaImages(basePane, leftPane);
      }
      row.addWidget(basePane);
      widgets.push(basePane);

      if (remote !== undefined) {
        let rightPane = this.makePane(remote);
        rightPane.addClass(classes[2]);
        row.addWidget(rightPane);
        widgets.push(rightPane);
        AttachmentMergeView.metaImages(basePane, rightPane);
      }
      if (row.widgets.length > 0) {
        this.addWidget(row);
        row = new FlexPanel({direction: 'left-to-right', evenSizes: true});
      }
    }

    let mergePane = this.makePane(merged);
    mergePane.addClass(classes[3]);
    row.addWidget(mergePane);
    widgets.push(mergePane);
    if (basePane) {
      AttachmentMergeView.metaImages(basePane, mergePane);
    }
    this.addWidget(row);
  }

  protected static metaImages(base: Widget, other?: Widget) {
    let baseImage = base.node.querySelector('img')!;
    let widthChanged = false;
    let heightChanged = false;
    let img = baseImage;
    if (other) {
      let otherImage = other.node.querySelector('img')!;
      img = otherImage;
      if (baseImage.naturalWidth !== otherImage.naturalWidth) {
        widthChanged = true;
      }
      if (baseImage.naturalHeight !== otherImage.naturalHeight) {
        heightChanged = true;
      }
    }

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

  protected makePane(model: AttachmentDiffModel | null, base?: boolean): Widget {
    let pane: Widget | null = null;
    if (model) {
      let bundle = base ? model.base : model.remote;
      if (bundle) {
        pane = this.rendermime.render({
          bundle: convertBundle(bundle)
        });
      }
    }
    if (!pane) {
      pane = new Widget();
      pane.node.innerText = 'Attachment missing';
    }
    pane.addClass(ATTACHMENT_CLASS);
    return pane;
  }

  rendermime: IRenderMime;
}
