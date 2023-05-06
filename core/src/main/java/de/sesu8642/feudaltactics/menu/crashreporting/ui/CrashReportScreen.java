// SPDX-License-Identifier: GPL-3.0-or-later

package de.sesu8642.feudaltactics.menu.crashreporting.ui;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

import javax.inject.Inject;
import javax.inject.Singleton;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.graphics.OrthographicCamera;
import com.badlogic.gdx.scenes.scene2d.Actor;
import com.badlogic.gdx.scenes.scene2d.utils.ChangeListener;
import com.badlogic.gdx.utils.viewport.Viewport;
import com.google.common.base.Strings;
import com.google.common.eventbus.EventBus;

import de.sesu8642.feudaltactics.events.ScreenTransitionTriggerEvent;
import de.sesu8642.feudaltactics.events.ScreenTransitionTriggerEvent.ScreenTransitionTarget;
import de.sesu8642.feudaltactics.menu.common.dagger.MenuCamera;
import de.sesu8642.feudaltactics.menu.common.dagger.MenuViewport;
import de.sesu8642.feudaltactics.menu.common.ui.GameScreen;
import de.sesu8642.feudaltactics.menu.crashreporting.CrashReportDao;

/**
 * Screen for crash reporting.
 */
@Singleton
public class CrashReportScreen extends GameScreen {

	private final Logger logger = LoggerFactory.getLogger(this.getClass());

	private EventBus eventBus;
	private final CrashReportStage crashReportStage;
	private final CrashReportDao crashReportDao;
	private final ScheduledExecutorService copyButtonFeedbackExecutorService;
	private ScheduledFuture<?> copyButtonFeedBackFuture;
	/**
	 * Whether the screen is shown on startup. Causes the splash screen to be shown
	 * on finish instead of the menu.
	 */
	private boolean isGameStartup = false;

	/** Constructor. */
	@Inject
	public CrashReportScreen(EventBus eventBus, @MenuCamera OrthographicCamera camera, @MenuViewport Viewport viewport,
			CrashReportStage crashReportStage, CrashReportDao crashReportDao,
			ScheduledExecutorService copyButtonFeedbackExecutorService) {
		super(camera, viewport, crashReportStage);
		this.eventBus = eventBus;
		this.crashReportStage = crashReportStage;
		this.crashReportDao = crashReportDao;
		this.copyButtonFeedbackExecutorService = copyButtonFeedbackExecutorService;
		registerEventListeners();
	}

	@Override
	public void show() {
		String crashReportText = crashReportDao.getLastCrashReport();
		if (!Strings.isNullOrEmpty(crashReportText)) {
			crashReportStage.crashReportSlide.textArea.setText(crashReportText);
		} else {
			crashReportStage.crashReportSlide.descriptionLabel.setText("No crashes were detected previously!");
			crashReportStage.crashReportSlide.textArea.setText("Nothing to see here.");
			crashReportStage.crashReportSlide.buttonGroup.removeActor(crashReportStage.crashReportSlide.sendMailButton);
			crashReportStage.crashReportSlide.buttonGroup.removeActor(crashReportStage.crashReportSlide.copyButton);
		}
		super.show();
	}

	private void registerEventListeners() {
		crashReportStage.setFinishedCallback(() -> {
			ScreenTransitionTarget onFinishedTarget = isGameStartup ? ScreenTransitionTarget.SPLASH_SCREEN
					: ScreenTransitionTarget.INFORMATION_MENU_SCREEN;
			eventBus.post(new ScreenTransitionTriggerEvent(onFinishedTarget));
		});
		crashReportStage.crashReportSlide.sendMailButton.addListener(new ChangeListener() {
			@Override
			public void changed(ChangeEvent event, Actor actor) {
				try {
					String totallyUnharvestableEmail = "con" + "tact@sesu" + "8642.de";
					URI mailtoUri = new URI("mailto", totallyUnharvestableEmail, null,
							"subject=FeudalTactics Crash Report&body="
									+ crashReportStage.crashReportSlide.textArea.getText(),
							null);
					// couldn't find a way to build a proper mailto uri without the forward slashes
					String mailtoUriString = mailtoUri.toString().replaceFirst("://", ":");
					logger.debug("Opening bug report mailto URI.");
					Gdx.net.openURI(mailtoUriString);
				} catch (URISyntaxException e) {
					// do not throw an exception while the user is trying to report an exception
					logger.warn("unable to build mailto URI with body: {}",
							crashReportStage.crashReportSlide.textArea.getText());
				}
			}
		});
		crashReportStage.crashReportSlide.copyButton.addListener(new ChangeListener() {

			@Override
			public void changed(ChangeEvent event, Actor actor) {
				logger.debug("copying bug report info to clipboard.");
				Gdx.app.getClipboard().setContents(crashReportStage.crashReportSlide.textArea.getText());
				// give feedback to the user by setting the button text to "done" for a moment
				crashReportStage.crashReportSlide.copyButton.setText("Done");
				if (copyButtonFeedBackFuture != null) {
					copyButtonFeedBackFuture.cancel(false);
				}
				copyButtonFeedBackFuture = copyButtonFeedbackExecutorService.schedule(
						() -> Gdx.app.postRunnable(() -> crashReportStage.crashReportSlide.copyButton.setText("Copy")),
						1000, TimeUnit.MILLISECONDS);
			}
		});
		crashReportStage.crashReportSlide.openGithubButton.addListener(new ChangeListener() {
			@Override
			public void changed(ChangeEvent event, Actor actor) {
				logger.debug("opening GitHub issue URI.");
				Gdx.net.openURI("https://github.com/Sesu8642/FeudalTactics/issues");
			}
		});
	}

	public boolean isGameStartup() {
		return isGameStartup;
	}

	public void setGameStartup(boolean isGameStartup) {
		this.isGameStartup = isGameStartup;
	}

}