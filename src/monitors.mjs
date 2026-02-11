export function registerMonitors(ctx, notifier) {
  const events = ctx.settings.section("Events");

  // ── 1. Combat Death / Idle ────────────────────────────
  ctx.patch(CombatManager, "onPlayerDeath").after(function () {
    if (events.get("notify-combat-death")) {
      notifier.send(
        "☠️ You Died!",
        "Your character died and combat has stopped."
      );
    }
  });

  // Also detect when the player runs out of enemies (area cleared)
  ctx.patch(CombatManager, "stop").after(function () {
    if (events.get("notify-combat-death")) {
      notifier.send("⚔️ Combat Stopped", "You are no longer in combat.");
    }
  });

  // ── 2. Skill Level Milestones ─────────────────────────
  ctx.patch(Skill, "levelUp").after(function () {
    if (!events.get("notify-skill-milestone")) return;

    const interval = events.get("milestone-interval");
    // `this` refers to the Skill instance being patched
    if (this.level % interval === 0) {
      notifier.send(
        "🎉 Level Up!",
        `${this.name} reached level ${this.level}!`
      );
    }
  });

  // ── 3. Farming Patches Ready ──────────────────────────
  ctx.patch(FarmingPlot, "grow").after(function () {
    if (!events.get("notify-farming-ready")) return;

    // When growth ticks complete, check if fully grown
    if (this.growthTime <= 0) {
      notifier.send(
        "🌾 Harvest Ready",
        `A ${this.plantedRecipe?.product?.name ?? "crop"} patch is ready to harvest.`
      );
    }
  });

  // ── 4. Bank Nearly Full ───────────────────────────────
  ctx.patch(Bank, "addItem").after(function () {
    if (!events.get("notify-bank-full")) return;

    const threshold = events.get("bank-threshold") / 100;
    const usage = this.occupiedSlots / this.maximumSlots;

    if (usage >= threshold) {
      const pct = Math.round(usage * 100);
      notifier.send(
        "🏦 Bank Almost Full",
        `Your bank is ${pct}% full (${this.occupiedSlots}/${this.maximumSlots} slots).`
      );
    }
  });

  // ── 5. Potion Charges Depleted ────────────────────────
  ctx.patch(PotionManager, "removeCharges").after(function () {
    if (!events.get("notify-potion-expired")) return;

    // Check each active potion slot for 0 charges
    for (const [skill, potion] of this.activePotions) {
      if (potion && potion.charges <= 0) {
        notifier.send(
          "🧪 Potion Expired",
          `Your ${potion.item.name} has run out of charges.`
        );
      }
    }
  });

  // ── 6. Slayer Task Complete ───────────────────────────
  ctx.patch(SlayerTask, "complete").after(function () {
    if (events.get("notify-task-complete")) {
      notifier.send(
        "🗡️ Slayer Task Complete",
        "Your slayer task is finished. Pick up a new one!"
      );
    }
  });
}
