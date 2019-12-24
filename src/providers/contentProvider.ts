import * as vscode from 'vscode';
import MagitStatusView from '../views/magitStatusView';
import { magitRepositories, views } from '../extension';
import { View } from '../views/general/view';
import { DocumentView } from '../views/general/documentView';
import MagitStagedView from '../views/stagedView';
import * as Constants from "../common/constants";
import { CommitDetailView } from '../views/commitDetailView';

export default class ContentProvider implements vscode.TextDocumentContentProvider {

  private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
  onDidChange = this._onDidChange.event;

  private _subscriptions: vscode.Disposable;

  constructor() {

    this._subscriptions = vscode.workspace.onDidCloseTextDocument(
      doc => {
        if (doc.uri.scheme === Constants.MagitUriScheme) {
          views.delete(doc.uri.toString());
        }
      });
  }

  dispose() {
    this._subscriptions.dispose();
    // this._documents.clear();
    // this._editorDecoration.dispose();
    this._onDidChange.dispose();
  }

  provideTextDocumentContent(uri: vscode.Uri): string | Thenable<string> {

    console.log("call to provide");

    let magitRepo = magitRepositories.get(uri.query);

    if (magitRepo) {

      let documentView: DocumentView | undefined;

      // Multiplexing should happen here

      switch (uri.path) {
        case MagitStatusView.UriPath:
          documentView = new MagitStatusView(uri, this._onDidChange, magitRepo.magitState!);
          break;
        case MagitStagedView.UriPath:
          documentView = new MagitStagedView(uri, this._onDidChange, magitRepo.magitState!);
          break;
        default:
          break;
      }

      if (documentView) {
        views.set(uri.toString(), documentView);
        return documentView.render(0).join('\n');
      }
    }
    // TODO: create views outside provider, and then:
    // How to update? when using this method?
    // REQUIRES A SLICK SOLUTION
    return views.get(uri.toString())?.render(0).join('\n') ?? "";
  }
}