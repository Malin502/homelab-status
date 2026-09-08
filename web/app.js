async function loadNodes() {
  const tbody = document.getElementById("nodes");

  try {
    const response = await fetch("/api/nodes");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    tbody.replaceChildren();

    for (const node of data.nodes) {
      const row = document.createElement("tr");
      const name = document.createElement("td");
      const status = document.createElement("td");

      name.textContent = node.name;
      status.textContent = node.ready ? "Ready" : "NotReady";
      status.className = node.ready ? "ready" : "not-ready";

      row.append(name, status);
      tbody.append(row);
    }
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="2">取得に失敗しました</td></tr>';
    console.error(error);
  }
}

document.getElementById("refresh").addEventListener("click", loadNodes);
loadNodes();


async function loadPods() {
  const tbody = document.getElementById("pods");

  try {
    const response = await fetch("/api/pods");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    tbody.replaceChildren();

    for (const pod of data.pods) {
      const row = document.createElement("tr");

      for (const value of [
        pod.nodeName || "-",
        pod.namespace,
        pod.name,
        pod.status
      ]) {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.append(cell);
      }

      tbody.append(row);
    }
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="4">取得に失敗しました</td></tr>';
    console.error(error);
  }
}

document.getElementById("refresh-pods").addEventListener("click", loadPods);
loadPods();