let db;
const request = indexedDB.open("budgetTracker", 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};
request.onsuccess = function (event) {
    db = event.target.result;

    if (navigator.onLine) {
        checkingDB();
    }
};
request.onerror = function (event) {
    console.log("There was an error! " + event.target.errorCode);
};
function saveInfo(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");

    store.add(record);
}
function checkingDB() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();
    getAll.onsuccess = function () {
        console.log(getAll.result);
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                },
            })
                .then((response) => response.json())
                .then(() => {
                    const transaction = db.transaction(
                        ["pending"],
                        "readwrite"
                    );
                    const store = transaction.objectStore("pending");
                    store.clear();
                });
        }
    };
}

window.addEventListener("online", checkingDB);
