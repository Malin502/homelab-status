async function loadNodes() {
  const tbody = document.getElementById("nodes");

  try {
    const response = await fetch("/api/nodes", {
    cache: "no-store"
    });
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
    throw error;
  }
}

document.getElementById("refresh").addEventListener("click", loadNodes);
loadNodes();


async function loadPods() {
  const tbody = document.getElementById("pods");

  try {
    const response = await fetch("/api/pods", {
      cache: "no-store"
    });
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
    throw error;
  }
}

const REFRESH_INTERVAL = 10000;
let refreshing = false;

async function refreshAll() {
  // 前回の取得が終わっていなければ重複実行しない
  if (refreshing) return;

  refreshing = true;

  const state = document.getElementById("refresh-state");
  const updated = document.getElementById("last-updated");

  state.textContent = "● 更新中...";
  state.classList.remove("error");

  try {
    await Promise.all([
      loadNodes(),
      loadPods()
    ]);

    updated.textContent =
      "最終更新: " + new Date().toLocaleTimeString("ja-JP");

    state.textContent = "● Auto Refresh: 10s";
  } catch (error) {
    state.textContent = "● 更新失敗";
    state.classList.add("error");
    console.error(error);
  } finally {
    refreshing = false;
  }
}

// 手動更新ボタン
document.getElementById("refresh")
  .addEventListener("click", refreshAll);

document.getElementById("refresh-pods")
  .addEventListener("click", refreshAll);

// 初回取得
refreshAll();

// 10秒ごとに自動更新
setInterval(refreshAll, REFRESH_INTERVAL);