

import {
  PathExt
} from '@jupyterlab/coreutils';

import {
  IRenderMimeRegistry
} from '@jupyterlab/rendermime';

import {
  ServerConnection
} from '@jupyterlab/services';

import {
  Widget
} from '@phosphor/widgets';

import {
  NbdimeWidget
} from './widget';



interface IApiResponse {
  is_git: boolean;
}


export
function diffNotebook(args: {readonly base: string, readonly remote: string, readonly rendermime: IRenderMimeRegistry}): Widget {
  let {base, remote} = args;
  let widget = new NbdimeWidget(args);
  widget.title.label = `Diff: ${base} ↔ ${remote}`;
  return widget;
}


export
function diffNotebookCheckpoint(args: {readonly path: string, readonly rendermime: IRenderMimeRegistry}): Widget {
  const {path, rendermime} = args;
  let nb_dir = PathExt.dirname(path);
  let name = PathExt.basename(path, '.ipynb');
  let base = PathExt.join(nb_dir, name + '.ipynb');
  let widget = new NbdimeWidget({base, rendermime, baseLabel: 'Checkpoint'});
  widget.title.label = `Diff checkpoint: ${name}`;
  return widget;
}


export
function diffNotebookGit(args: {readonly path: string, readonly rendermime: IRenderMimeRegistry}): Widget {
  const {path, rendermime} = args;
  let name = PathExt.basename(path, '.ipynb');
  let widget = new NbdimeWidget({base: path, rendermime});
  widget.title.label = `Diff git: ${name}`;
  return widget;
}


export
function isNbInGit(args: {readonly path: string}): Promise<boolean> {
  let request = {
      method: 'POST',
      body: JSON.stringify(args),
    };
  let settings = ServerConnection.makeSettings();
  return ServerConnection.makeRequest('/nbdime/api/isgit', request, settings).then((response) => {
      return response.json() as Promise<IApiResponse>;
    }).then((data) => {
      return data['is_git'];
    });
}

