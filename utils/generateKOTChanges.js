export function generateKOTChanges(oldItems = [], newItems = []) {
  const changes = [];
  const oldMap = new Map(oldItems.map((i) => [i.item, i.qty]));
  const newMap = new Map(newItems.map((i) => [i.item, i.qty]));

  // 🔹 Detect new items or increased qty
  for (const [name, qty] of newMap) {
    if (!oldMap.has(name)) {
      // new item added
      changes.push({ name, qty: `+${qty}`, type: 'new' });
    } else {
      const diff = qty - oldMap.get(name);
      if (diff > 0) changes.push({ name, qty: `+${diff}`, type: 'update' });
      if (diff < 0) changes.push({ name, qty: `${diff}`, type: 'update' }); // e.g. -1
    }
  }

  // 🔹 Detect cancelled items (removed completely)
  for (const [name] of oldMap) {
    if (!newMap.has(name)) {
      changes.push({ name, qty: '0', type: 'cancel' });
    }
  }

  return changes;
}
