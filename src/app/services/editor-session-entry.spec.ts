import { of, Subject } from "rxjs";
import { CreateGameListPage } from "../pages/create-game/create-game-list/create-game-list.page";
import { CreateGameOverviewPage } from "../pages/create-game/create-game-overview/create-game-overview.page";
import { EditGameOverviewPage } from "../pages/edit-game/edit-game-overview/edit-game-overview.page";
import { EditGameTasksPage } from "../pages/edit-game/edit-game-tasks/edit-game-tasks.page";

// A game being created or edited works on one snapshot of the Simple/Advanced policy.
// The editors take a fresh snapshot where the author enters them; the pages after
// that join the running session instead of fetching again.
describe("authoring sessions", () => {
  const visibility = () => ({
    startSession: jasmine.createSpy("startSession"),
    isVisible: () => true,
    changes$: of(undefined),
  });

  it("start with a fresh snapshot when the author enters the task list of a new game", async () => {
    const page: any = Object.create(CreateGameListPage.prototype);
    page.editorVisibility = visibility();
    page.gameFactory = { getGame: () => Promise.resolve({ _id: 0 }), flushGame: () => {}, initializeGame: () => ({}) };
    await page.ngOnInit();
    expect(page.editorVisibility.startSession).toHaveBeenCalledTimes(1);
    expect(page.editorVisibility.startSession.calls.mostRecent().args).toEqual([]); // fetch the latest policy
  });

  it("start with a fresh snapshot when the author enters the task list of an existing game", () => {
    const page: any = Object.create(EditGameTasksPage.prototype);
    page.editorVisibility = visibility();
    page.route = { params: new Subject() };
    page.ngOnInit();
    expect(page.editorVisibility.startSession).toHaveBeenCalledTimes(1);
    expect(page.editorVisibility.startSession.calls.mostRecent().args).toEqual([]);
  });

  it("are joined, not restarted, by the save screens", () => {
    const create: any = Object.create(CreateGameOverviewPage.prototype);
    create.ev = visibility();
    create.route = { params: new Subject() };
    create.user = new Subject();
    create.ngOnInit();
    expect(create.ev.startSession).toHaveBeenCalledTimes(1);
    expect(create.ev.startSession.calls.mostRecent().args).toEqual([false]);

    const edit: any = Object.create(EditGameOverviewPage.prototype);
    edit.ev = visibility();
    edit.user = new Subject();
    edit.ngOnInit();
    expect(edit.ev.startSession).toHaveBeenCalledTimes(1);
    expect(edit.ev.startSession.calls.mostRecent().args).toEqual([false]);
  });
});
