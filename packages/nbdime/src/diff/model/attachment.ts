// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

import {
  nbformat
} from '@jupyterlab/services';

import {
  each
} from 'phosphor/lib/algorithm/iteration';

import {
  IDiffEntry, IDiffObjectEntry
} from '../diffentries';

import {
  PatchObjectHelper
} from '../../patch';

import {
  RenderableDiffModel
} from './renderable';


/**
 * Diff model for an attachment
 *
 * Can be converted to a StringDiffModel via the method `stringify()`, which also
 * takes an optional argument `key` which specifies a subpath of the IOutput to
 * make the model from.
 */
export
class AttachmentDiffModel extends RenderableDiffModel<nbformat.IMimeBundle> {
  constructor(key: string,
              base: nbformat.IMimeBundle | null,
              remote: nbformat.IMimeBundle | null,
              diff?: IDiffEntry[] | null) {
    super(base, remote, diff);
  }
  /**
   * Checks whether the given mimetype is present in the attachment.
   * If so, it returns the path/key to that mimetype's data. If not present,
   * it returns null.
   */
  hasMimeType(mimetype: string): string | null {
    let data = this.base || this.remote!;
    if (mimetype in data) {
      return mimetype;
    }
    return null;
  }

  /**
   * The key of the attachment
   */
  key: string;
}


/**
 * Function used to create a list of models for a list diff
 *
 * - If base and remote are both equal, it returns
 *   a list of models representing unchanged entries.
 * - If base and a diff is given, it ignores remote and returns
 *   a list of models representing the diff.
 * - If base is null, it returns a list of models representing
 *   added entries.
 * - If remote is null, it returns a list of models representing
 *   deleted entries.
 */
export
function makeAttachmentModels(
      base: nbformat.IAttachments | null | undefined,
      remote: nbformat.IAttachments | null | undefined,
      diff?: IDiffObjectEntry[] | null) : AttachmentDiffModel[] {
  let models: AttachmentDiffModel[] = [];
  if (remote === base) {
    if (base) {
      // All entries unchanged
      for (let key of Object.keys(base)) {
        models.push(new AttachmentDiffModel(key, base[key], base[key]));
      }
    } // otherwise, leave models empty
  } else {
    if (base && diff) {
      // Entries patched, remote will be null
      let helper = new PatchObjectHelper(base, diff);
      each(helper.keys(), key => {
        if (helper.isDiffKey(key)) {
          let d = helper.getDiffEntry(key);
          if (d.op === 'add') {
            // Entry added
            models.push(new AttachmentDiffModel(key, null, d.value));
          } else if (d.op === 'remove') {
            // Entry deleted
            models.push(new AttachmentDiffModel(key, base[key], null));
          } else if (d.op === 'replace') {
            // Entry replaced
            models.push(new AttachmentDiffModel(key, base[key], d.value));
          } else {
            // Entry patched
            models.push(new AttachmentDiffModel(key, base[key], null, d.diff));
          }
        } else {
          // Entry unchanged
          models.push(new AttachmentDiffModel(key, base[key], base[key]));
        }
      });
    } else if (remote === null) {
      // Cell deleted
      if (base !== undefined) {
        for (let key of Object.keys(base)) {
          models.push(new AttachmentDiffModel(key, base![key], null));
        }
      }
    } else if (base === null) {
      // Cell added
      if (remote !== undefined) {
        for (let key of Object.keys(remote)) {
          models.push(new AttachmentDiffModel(key, null, remote![key]));
        }
      }
    }
  }
  return models;
}
