============
Installation
============

Installing nbdime
=================

To install the latest stable release using :command:`pip`::

    pip install --upgrade nbdime

This will also install and enable the nbdime extensions
(server, notebook and jupyterlab). To disable these extensions, run::

    nbdime extensions --disable [--sys-prefix/--user/--system]

The ``--system`` (default) and ``--user`` flags determine which users
the extensions will be configured for. Note that you should
use ``--sys-prefix`` to only enable it for the currently active
virtual environment (e.g. with conda or virtualenv).

If the extensions did not install/enable on install, you can run::

    nbdime extensions --enable [--sys-prefix/--user/--system]

where the flags are the same as described above.

For manual registration see :doc:`extensions`.


Dependencies
------------

nbdime requires Python version 3.4 or higher.

nbdime depends on the following Python packages,
which will be installed by :command:`pip`:

  - nbformat
  - tornado
  - colorama
  - requests
  - GitPython
  - notebook
  - jinja2

and nbdime's web-based viewers depend on the following Node.js packages:

  - codemirror
  - json-stable-stringify
  - jupyter-js-services
  - jupyterlab
  - phosphor
  - alertify.js
  - file-saver


Installing latest development version
=====================================

Installing a development version of nbdime requires
`Node.js <https://nodejs.org>`_.

Installing nbdime using :command:`pip` will install the Python package
dependencies and
will automatically run ``npm`` to install the required Node.js packages.

To install Node.js, either follow the instructions on its webpage or install it
from conda (``conda install nodejs``). Alternatively, if you use ``venv`` to
manage your environment, you can install ``nodeenv`` to have node managed by
venv. See :doc:`this page <nodevenv>` for details.


Install with pip
----------------

Download and install directly from source::

    pip install -e git+https://github.com/jupyter/nbdime#egg=nbdime

Or clone the `nbdime repository <https://github.com/jupyter/nbdime>`_
and use ``pip`` to install::

    git clone https://github.com/jupyter/nbdime
    cd nbdime
    pip install -e .


Installing Jupyter extensions
-----------------------------

If you want to use the development version of the notebook and lab extensions,
you will also have to run the following commands after the pip dev install::

    jupyter serverextension enable --py nbdime [--sys-prefix/--user/--system]

    jupyter nbextension install --py nbdime [--sym-link] [--sys-prefix/--user/--system]
    jupyter nbextension enable --py nbdime [--sys-prefix/--user/--system]

    jupyter labextension link ./packages/nbdime --no-build
    jupyter labextension install ./packages/labextension


If you do any changes to the front-end code, run ``npm run build`` from the
repoistory root to rebuild the extensions. If you make any changes to the
server extension, you will have to restart the server to pick up the changes!


.. note::

    The optional ``--sym-link`` flag for ``jupyter nbextension install`` allows
    the notebook frontend to pick up a newly built version of the extension on
    a page refresh. For details on the other flags, see
    :doc:`extensions`.



.. toctree::
   :hidden:

   nodevenv
