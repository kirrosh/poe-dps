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
  // Шаблоны для поиска параметров
  const damagePattern = /Physical Damage:\s*(\d+)-(\d+)/;
  const attackSpeedPattern = /Attacks per Second:\s*([\d.]+)/;
  const qualityPattern = /Quality:\s*\+(\d+)%/;

  const damageMatch = input.match(damagePattern);
  const attackSpeedMatch = input.match(attackSpeedPattern);
  const qualityMatch = input.match(qualityPattern);

  if (damageMatch && attackSpeedMatch) {
    const currentMinDamage = parseInt(damageMatch[1], 10);
    const currentMaxDamage = parseInt(damageMatch[2], 10);
    const attackSpeed = parseFloat(attackSpeedMatch[1]);
    const quality = qualityMatch ? parseInt(qualityMatch[1], 10) : 0;

    // Убираем влияние качества, чтобы найти базовый урон
    const qualityMultiplier = 1 + quality / 100;
    const baseMinDamage = currentMinDamage / qualityMultiplier;
    const baseMaxDamage = currentMaxDamage / qualityMultiplier;

    // Текущий DPS с учётом качества
    const currentAverageDamage = (currentMinDamage + currentMaxDamage) / 2;
    const currentDps = currentAverageDamage * attackSpeed;

    // Базовый DPS без учёта качества
    const baseAverageDamage = (baseMinDamage + baseMaxDamage) / 2;
    const baseDps = baseAverageDamage * attackSpeed;

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
      currentDps: parseFloat(currentDps.toFixed(2)), // Текущий DPS
      maxDps: parseFloat(maxDps.toFixed(2)), // DPS при максимальном качестве
    };
  }

  return null; // В случае, если данные не найдены
}

function App() {
  const [weaponData, setWD] = createSignal<WeaponData | null>(null);
  const [err, setErr] = createSignal("");

  return (
    <div class="grid place-items-center h-screen w-screen bg-gray-900 text-white content-center">
      <h1 class="text-4xl font-bold mb-auto">POE DPS</h1>

      <div class="w-full max-w-2xl p-4 ">
        <textarea
          placeholder="Enter weapon data"
          class="w-full h-64 p-4 border-2 border-gray-300 rounded-md resize-none bg-gray-900 text-white"
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
        {err() && <p class="text-red-500">{err()}</p>}
      </div>
      {weaponData() && (
        <p class="text-2xl">
          Current DPS:{" "}
          <span class=" text-yellow-500">{weaponData()?.currentDps}</span>
        </p>
      )}
      {weaponData() && (
        <p class="text-2xl">
          Max DPS on 20% Quality :
          <span class=" text-green-500"> ~{weaponData()?.maxDps}</span>
        </p>
      )}
    </div>
  );
}

export default App;
