import { createSignal } from "solid-js";

interface WeaponData {
  baseMinDamage: number;
  baseMaxDamage: number;

  attackSpeed: number;
  quality: number;
  currentDps: number;
  maxDps: number;
}

function parseWeaponData(input: string): WeaponData | null {
  // const physicalDamagePattern = /Physical Damage:\s*(\d+)-(\d+)/;
  const damageTypesPattern =
    /((?:\w+ Damage):\s*(?:\d+-\d+(?:\s*\([^)]+\))?(?:,\s*)?)+)/g;
  const attackSpeedPattern = /Attacks per Second:\s*([\d.]+)/;
  const qualityPattern = /Quality:\s*\+(\d+)%/;

  // const physicalMatch = input.match(physicalDamagePattern);
  const attackSpeedMatch = input.match(attackSpeedPattern);
  const qualityMatch = input.match(qualityPattern);

  if (attackSpeedMatch) {
    // const currentMinDamage = parseInt(physicalMatch[1], 10);
    // const currentMaxDamage = parseInt(physicalMatch[2], 10);
    const attackSpeed = parseFloat(attackSpeedMatch[1]);
    const quality = qualityMatch ? parseInt(qualityMatch[1], 10) : 0;

    // Парсинг всех типов дополнительного урона
    let totalCurrentMinDamage = 0;
    let totalCurrentMaxDamage = 0;

    const damageTypeMatches = input.matchAll(damageTypesPattern);
    for (const match of damageTypeMatches) {
      const damageLine = match[1];
      const damageValues = damageLine.matchAll(/(\d+)-(\d+)/g);
      for (const damageValue of damageValues) {
        const min = parseInt(damageValue[1], 10);
        const max = parseInt(damageValue[2], 10);
        totalCurrentMinDamage += min;
        totalCurrentMaxDamage += max;
      }
    }

    // Общий урон (физический + элементальный)
    // const totalCurrentMinDamage = currentMinDamage + elementalMinDamage;
    // const totalCurrentMaxDamage = currentMaxDamage + elementalMaxDamage;

    // Убираем влияние качества, чтобы найти базовый урон
    const qualityMultiplier = 1 + quality / 100;
    const baseMinDamage = totalCurrentMinDamage / qualityMultiplier;
    const baseMaxDamage = totalCurrentMaxDamage / qualityMultiplier;

    // Текущий DPS с учётом качества и элементального урона
    const currentAverageDamage =
      (totalCurrentMinDamage + totalCurrentMaxDamage) / 2;
    const currentDps = currentAverageDamage * attackSpeed;

    // DPS при максимальном качестве (+20%)
    const maxQualityMultiplier = 1.2;
    const maxMinDamage = baseMinDamage * maxQualityMultiplier;
    const maxMaxDamage = baseMaxDamage * maxQualityMultiplier;
    const maxAverageDamage = (maxMinDamage + maxMaxDamage) / 2;
    const maxDps = maxAverageDamage * attackSpeed;

    return {
      baseMinDamage: parseFloat(baseMinDamage.toFixed(2)),
      baseMaxDamage: parseFloat(baseMaxDamage.toFixed(2)),
      attackSpeed,
      quality,
      currentDps: parseFloat(currentDps.toFixed(2)),
      maxDps: parseFloat(maxDps.toFixed(2)),
    };
  }

  return null;
}

function App() {
  const [weaponData, setWD] = createSignal<WeaponData | null>(null);
  const [err, setErr] = createSignal("");

  return (
    <div
      class="h-screen w-screen bg-slate-800 grid grid-rows-2"
      style={{
        "grid-template-rows": "auto 100px",
      }}
    >
      <div class="grid place-items-center  text-slate-100 content-center">
        <h1 class="text-4xl font-bold mb-auto text-sky-400">
          Path of Exile 2 DPS Calculator
        </h1>
        <p class="mb-8 text-slate-300">
          Quickly and easily calculate DPS for Path of Exile 1/2 (PoE 1/2).
        </p>
        <div class="w-full max-w-2xl p-4">
          <p class="my-2 text-lg text-slate-300">
            Press CTRL + C on the weapon in-game to copy its data, then paste it
            here.
          </p>
          <textarea
            placeholder="Enter weapon data"
            class="w-full h-64 p-4 border-2 border-slate-600 rounded-md resize-none bg-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-400"
            onInput={(e) => {
              const input = e.currentTarget.value;
              const weaponData = parseWeaponData(input);
              if (weaponData) {
                console.log(weaponData);
                setWD(weaponData);
                setErr("");
              } else {
                setErr("Invalid weapon data");
                setWD(null);
              }
            }}
          />
          {err() && <p class="text-red-400">{err()}</p>}
        </div>

        {weaponData() && (
          <p class="text-2xl">
            Current DPS:{" "}
            <span class="text-amber-400">{weaponData()?.currentDps}</span>
          </p>
        )}

        {weaponData() && (
          <p class="text-2xl">
            Max DPS on 20% Quality:{" "}
            <span class="text-lime-400">~{weaponData()?.maxDps}</span>
          </p>
        )}
      </div>
      <footer class="text-center text-sm text-sky-400  border-sky-400 p-4 border-t">
        This site is not affiliated with or endorsed by Grinding Gear Games.
        Path of Exile and Path of Exile 2 are trademarks or registered
        trademarks of Grinding Gear Games.
      </footer>
    </div>
  );
}

export default App;
