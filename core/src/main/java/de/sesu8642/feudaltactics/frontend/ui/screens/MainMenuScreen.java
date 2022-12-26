// SPDX-License-Identifier: GPL-3.0-or-later

package de.sesu8642.feudaltactics.frontend.ui.screens;

import javax.inject.Inject;
import javax.inject.Singleton;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.Screen;
import com.badlogic.gdx.graphics.OrthographicCamera;
import com.badlogic.gdx.scenes.scene2d.ui.Dialog;
import com.badlogic.gdx.utils.viewport.Viewport;
import com.google.common.eventbus.EventBus;

import de.sesu8642.feudaltactics.frontend.dagger.qualifierannotations.MainMenuStage;
import de.sesu8642.feudaltactics.frontend.dagger.qualifierannotations.MenuCamera;
import de.sesu8642.feudaltactics.frontend.dagger.qualifierannotations.MenuViewport;
import de.sesu8642.feudaltactics.frontend.events.ScreenTransitionTriggerEvent;
import de.sesu8642.feudaltactics.frontend.events.ScreenTransitionTriggerEvent.ScreenTransitionTarget;
import de.sesu8642.feudaltactics.frontend.persistence.GameVersionDao;
import de.sesu8642.feudaltactics.frontend.ui.DialogFactory;
import de.sesu8642.feudaltactics.frontend.ui.stages.MenuStage;

/** {@link Screen} for displaying the main menu. */
@Singleton
public class MainMenuScreen extends GameScreen {

	private static final String TAG = MainMenuScreen.class.getName();

	private GameVersionDao gameVersionDao;
	private DialogFactory dialogFactory;
	private EventBus eventBus;

	/**
	 * Constructor.
	 * 
	 * @param gameVersionDao dao for interacting with version persistence
	 * @param camera         camera for the menus
	 * @param viewport       viewport for the menus
	 * @param mainMenuStage  stage for the main menu
	 * @param dialogFactory  factory for creating dialogs
	 * @param eventBus       event bus
	 */
	@Inject
	public MainMenuScreen(GameVersionDao gameVersionDao, @MenuCamera OrthographicCamera camera,
			@MenuViewport Viewport viewport, @MainMenuStage MenuStage mainMenuStage, DialogFactory dialogFactory,
			EventBus eventBus) {
		super(camera, viewport, mainMenuStage);
		this.gameVersionDao = gameVersionDao;
		this.dialogFactory = dialogFactory;
		this.eventBus = eventBus;
	}

	@Override
	public void show() {
		super.show();
		if (gameVersionDao.getChangelogState()) {
			// show the dialog only once after the update
			gameVersionDao.saveChangelogState(false);
			showNewVersionDialog();
		}
	}

	private void showNewVersionDialog() {
		Gdx.app.debug(TAG, "informing the user about the version upgrade");
		Dialog newVersionDialog = dialogFactory.createDialog(result -> {
			switch ((byte) result) {
			case 0:
				// ok button
				Gdx.app.debug(TAG, "the user dismissed the version upgrade dialog");
				break;
			case 1:
				// open changelog button
				Gdx.app.debug(TAG, "the user openened the changelog");
				eventBus.post(new ScreenTransitionTriggerEvent(ScreenTransitionTarget.CHANGELOG_SCREEN));
				break;
			default:
				break;
			}
		});
		newVersionDialog.text("The game was updated. See the changelog for details.\n");
		newVersionDialog.button("OK", (byte) 0);
		newVersionDialog.button("Open changelog", (byte) 1);
		newVersionDialog.show(getActiveStage());
	}

}
