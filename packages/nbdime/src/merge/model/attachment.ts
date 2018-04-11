// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

import {
  nbformat
} from '@jupyterlab/services';

import {
  IDiffEntry, IDiffObjectEntry
} from '../../diff/diffentries';

import {
  AttachmentDiffModel, makeAttachmentModels
} from '../../diff/model';

import {
  MergeDecision, applyDecisions, resolveCommonPaths
} from '../../merge/decisions';

import {
  hasEntries
} from '../../common/util';

import {
  SetA
} from '../../common/set';

import {
  NotifyUserError
} from '../../common/exceptions';




/**
 * Model of a merge of metadata with decisions
 */
export
class AttachmentsMergeModel {

  protected static getAttachmentsFromDiff(diff: IDiffEntry[] | null): nbformat.IAttachments | undefined {
    if (!hasEntries(diff)) {
      return undefined;
    }
    if (diff.length > 1) {
      throw new NotifyUserError('Invalid diff on attachments');
    }
    let d = diff[0];
    if (d.op !== 'add' && d.op !== 'replace') {
      throw new NotifyUserError('Invalid diff on attachments');
    }
    return d.value;
  }


  constructor(base: nbformat.IAttachments | undefined, decisions: MergeDecision[]) {
    this.init(base, decisions);
  }

  unchanged(): boolean {
    return !hasEntries(this.decisions);
  }

  conflicted(): boolean {
    for (let dec of this.decisions) {
      if (dec.conflict) {
        return true;
      }
    }
    return false;
  }

  serialize(): nbformat.IAttachments | null | undefined {
    if (this.delete) {
      return undefined;
    }

  }

  protected init(base: nbformat.IAttachments | undefined, decisions: MergeDecision[]) {
    // Possible scenarios:
    // 1.1. Existing base, with patches (on deeper key)
    // 1.2. Existing base, with onesided replace
    // 1.3. Existing base, with conflicting replace vs patches
    // 1.4. Existing base, twosided replace, agreed
    // 1.5. Existing base, twosided replace, conflicting
    // 2.1. No base, one-sided addition
    // 2.2. No base, agreement addition
    // 2.3. No base, conflicting addition

    // Observations:
    // - Only 1.1 can have multiple decisions
    // - 1.4 and 2.2 can be treated as the same
    // - 1.5 and 2.3 can be treated as the same

    // TODO: Needed?
    resolveCommonPaths(decisions);

    if (decisions.length === 0) {
      this.base = base;
      this.decisions = [];
      return;
    }

    if (base) {
      // 1.X
      this.initWithBase(base, decisions)
    } else {
      // 2.X
    }
  }

  protected initWithBase(base: nbformat.IAttachments, decisions: MergeDecision[]) {
    if (decisions.length > 1) {
      // 1.1
      this.initFromPatches(base, decisions);
      return;
    }
    let dec = decisions[0];
    if (dec.absolutePath.length > 3) {
      // 1.1 - Path goes deeper than attachments
      this.initFromPatches(base, decisions);
      return;
    }
    let local = hasEntries(dec.localDiff);
    let remote = hasEntries(dec.remoteDiff);
    if (local && remote) {
      // Twosided
    } else {
      // 1.2
    }
  }

  protected initFromPatches(base: nbformat.IAttachments, decisions: MergeDecision[]) {

  }

  protected initWithoutBase(base: nbformat.IAttachments) {

  }

  base: nbformat.IAttachments | undefined;

  decisions: MergeDecision[];

  delete: boolean;
}
