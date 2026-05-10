============
Google Drive
============

The *Google Drive* integration allows users to create and manage *Google Drive* documents (such as
*Google Docs*, *Google Sheets*, and *Google Slides*) directly from Odoo records.

.. _google-drive/google-api:

Google API console
==================

The setup for integrating *Google Drive* into Odoo is done through the *Google API console*. Once
the following steps are complete, OAuth credentials are created and used to configure Odoo.

.. seealso::
   `Google Drive API overview <https://developers.google.com/drive/api/guides/about-sdk>`_

.. _google-drive/google-api/project:

Create a new project
--------------------

Go to the `Google API console <https://console.developers.google.com>`_ and sign in with a *Google
Workspace* account, or a personal Gmail account if a *Google Workspace* account is not available.

Click :guilabel:`Create Project`. On the :guilabel:`New Project` screen, enter a
:guilabel:`Project name` (e.g., `Odoo Drive`), select the :guilabel:`Location`, and click
:guilabel:`Create`.

.. tip::
   If existing projects are already listed in the *Google API Console*, click the drop-down menu
   next to the :guilabel:`Google Cloud` icon, and click :guilabel:`New Project` in the pop-over
   window.

.. _google-drive/google-api/enable:

Enable Google Drive API
-----------------------

With the project selected, open the navigation menu and go to :menuselection:`APIs & Services -->
Library`. Search for `Google Drive API`, click the result, and click :guilabel:`Enable`.

.. _google-drive/google-api/consent:

Configure the OAuth consent screen
-----------------------------------

Go to :menuselection:`APIs & Services --> OAuth consent screen`. Select :guilabel:`Internal` as the
:guilabel:`User Type` if using a *Google Workspace* account, or :guilabel:`External` if using a
personal Gmail account, then click :guilabel:`Create`.

Fill in the required fields:

- :guilabel:`App name`: Enter a name (e.g., `Odoo`).
- :guilabel:`User support email`: Select the appropriate email address.
- :guilabel:`Developer contact information`: Enter an email address.

Click :guilabel:`Save and Continue`. On the :guilabel:`Scopes` page, click :guilabel:`Save and
Continue` without adding any scopes. On the :guilabel:`Summary` page, click :guilabel:`Back to
Dashboard`.

.. _google-drive/google-api/credentials:

Create OAuth credentials
------------------------

Go to :menuselection:`APIs & Services --> Credentials`, click :guilabel:`Create Credentials`, and
select :guilabel:`OAuth client ID`.

Set the :guilabel:`Application type` to :guilabel:`Web application` and enter a name (e.g.,
`Odoo`).

Under :guilabel:`Authorized redirect URIs`, click :guilabel:`Add URI` and enter the following URI,
replacing `<odoo-instance>` with the domain of the Odoo database:

.. code-block:: text

   https://<odoo-instance>/google_drive/authentication

Click :guilabel:`Create`. Note down the :guilabel:`Client ID` and :guilabel:`Client Secret` shown
in the confirmation dialog, as they are used when :ref:`configuring Odoo
<google-drive/odoo-config>`.

.. image:: google_drive/oauth-credentials.png
   :alt: OAuth Client ID and Client Secret confirmation dialog

.. _google-drive/odoo-config:

Odoo configuration
==================

#. Go to :menuselection:`Settings --> Integrations` and enable :guilabel:`Google Drive`.
#. Enter the :guilabel:`Client ID` and :guilabel:`Client Secret` obtained from the
   :ref:`Google API console <google-drive/google-api/credentials>`.
#. Click :guilabel:`Save`.

.. image:: google_drive/odoo-settings.png
   :alt: Google Drive settings in Odoo

.. _google-drive/templates:

Google Drive templates
======================

*Google Drive* templates allow users to create pre-configured Google documents directly from any
Odoo record. Templates are linked to a specific model in Odoo and can be accessed from the
record's action menu.

.. _google-drive/templates/create:

Create a template
-----------------

#. Create a document in *Google Drive* (e.g., a *Google Doc*, *Google Sheet*, or *Google Slide*)
   that will serve as the template.
#. Go to :menuselection:`Settings --> Technical --> Google Drive --> Google Drive Templates`.
#. Click :guilabel:`New` and fill in the following fields:

   - :guilabel:`Name`: Enter a name for the template.
   - :guilabel:`Template URL`: Paste the URL of the *Google Drive* document.
   - :guilabel:`Model`: Select the Odoo model this template applies to (e.g.,
     :guilabel:`Sales Order`).
   - :guilabel:`Google Drive Name Pattern`: Enter a naming pattern for documents created from
     this template. Use placeholders such as `{{ object.name }}` to dynamically include record
     field values.

#. Click :guilabel:`Save`.

.. _google-drive/templates/use:

Use a template
--------------

To create a document from a template, open any record of the linked model (e.g., a sales order),
click the :icon:`fa-cog` (:guilabel:`Actions`) button, and select the template name from the list.

A new *Google Drive* document is created based on the template, named according to the configured
pattern, and a link to the document is saved on the record.
