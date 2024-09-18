"use strict";
const electron = require("electron");
const utils = require("@electron-toolkit/utils");
const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const sqlite3__namespace = /* @__PURE__ */ _interopNamespaceDefault(sqlite3);
const devLog = (message) => {
  console.log(`##### ${message}`);
};
var RequestMode = /* @__PURE__ */ ((RequestMode2) => {
  RequestMode2["Create"] = "create";
  RequestMode2["Edit"] = "edit";
  RequestMode2["Delete"] = "delete";
  return RequestMode2;
})(RequestMode || {});
var FilePath = /* @__PURE__ */ ((FilePath2) => {
  FilePath2["AppDirectory"] = "MyBookmark";
  FilePath2["SettingFile"] = "MyBookmark/settings.json";
  return FilePath2;
})(FilePath || {});
let contextMenu = null;
const showContextMenu = (category, callback) => {
  const isCreate = category === null;
  devLog(`showContextMenu: ${category?.id}`);
  if (!contextMenu) {
    contextMenu = electron.Menu.buildFromTemplate([
      {
        label: "Create",
        enabled: isCreate,
        click: () => {
          callback(category, RequestMode.Create);
        }
      },
      {
        label: "Edit",
        enabled: !isCreate,
        click: () => {
          callback(category, RequestMode.Edit);
        }
      },
      {
        label: "Delete",
        enabled: !isCreate,
        click: () => {
        }
      }
    ]);
  } else {
    contextMenu.items.map((m) => {
      if (m.label === "Create") {
        m.enabled = isCreate;
      } else {
        m.enabled = !isCreate;
      }
    });
  }
  contextMenu.popup();
};
const Prefix = {
  CategoriEdit: "ed.category-edit"
};
const ED = {
  /** カテゴリリスト */
  CategoryList: {
    /** カテゴリリストロード */
    Load: "ed.category-list.load",
    /** コンテキストメニュー */
    ContextMenu: {
      /**
       * メニュー表示
       */
      Show: "ed.category-list.context-menu.show",
      /**
       * メニュー選択
       */
      MenuSelected: "ed.category-list.context-menu.menu-selected",
      /**
       * カテゴリコンテキストメニュー選択
       */
      CreateRequest: "ed.category-list.context-menu.create-request",
      EditRequest: "ed.category-list.context-menu.edit-request",
      DeleteRequest: "ed.category-list.context-menu.edit-request",
      CreateResponse: "ed.category-list.context-menu.create-response",
      EditResponset: "ed.category-list.context-menu.edit-response",
      DeleteResponse: "ed.category-list.context-menu.edit-response"
    }
  },
  /** カテゴリ編集 */
  CategoryEdit: {
    /** ロードイベント */
    Load: "ed.category-edit.loadd",
    /** データ作成 */
    Create: "ed.category-edit.create",
    /** データ更新 */
    Update: "ed.category-edit.update",
    /** キャンセル */
    // Cancel: 'ed.category-edit.cancel'
    Cancel: `${Prefix.CategoriEdit}.cancel`
  }
};
const createDataDir = () => {
  const filePath = path.join(electron.app.getPath("appData"), FilePath.AppDirectory);
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }
};
const getCreateTableSql$1 = () => {
  return `
    CREATE TABLE category (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        sort INTEGER DEFAULT 0
    )
  `;
};
const create = async (category) => {
  devLog(`categoryTable.create`);
  try {
    let sql = `
      insert into category(name) values(?)
    `;
    category.id = await insert(sql, [category.name]);
    sql = `
      select max(sort) as max_sort from category
    `;
    const rows = await query(sql);
    category.sort = rows[0] + 1;
    sql = `
      update category set
        sort=?
      where id=?
    `;
    modify(sql, [category.sort, category.id]);
    return category;
  } catch (error) {
    console.error("Error query database:", error);
    return void 0;
  }
};
const update = async (category) => {
  try {
    const sql = `
      update category set name = ?
      where id = ?
    `;
    modify(sql, [category.name, category.id]);
    return category;
  } catch (error) {
    console.error("Error query database:", error);
    return void 0;
  }
};
const selectAll = async () => {
  try {
    const sql = `
      SELECT id, name, sort FROM category
        ORDER BY sort
    `;
    return await query(sql);
  } catch (error) {
    console.error("Error query database:", error);
    return [];
  }
};
const getCreateTableSql = () => {
  return `
    CREATE TABLE item (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        categoryId INTEGER,
        name TEXT,
        sort INTEGER,
        url TEXT,
        explanation TEXT
    )
  `;
};
const db = new sqlite3__namespace.Database("app.db");
const initDatabase = async () => {
  devLog(`initDatabase`);
  let hasError = true;
  try {
    await query("select id from category limit 1");
    hasError = false;
  } catch (error) {
    console.error("Error query database:", error);
  }
  if (!hasError) {
    return;
  }
  try {
    devLog(`create table`);
    await modify(getCreateTableSql$1());
    await modify(getCreateTableSql());
  } catch (error) {
    console.error("Error query database:", error);
  }
};
const query = async (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, function(err, rows) {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};
const modify = async (sql, params = []) => {
  return new Promise((resolve, rejects) => {
    db.run(sql, params, function(err) {
      if (err) {
        rejects(err);
      } else {
        resolve();
      }
    });
  });
};
const insert = async (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
};
let categoryEditWindow = null;
const createCategoryEditWindow = (parent, category) => {
  if (null != categoryEditWindow && !categoryEditWindow.isDestroyed()) {
    categoryEditWindow.close();
  }
  categoryEditWindow = new electron.BrowserWindow({
    parent,
    width: 400,
    height: 200,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });
  categoryEditWindow.title = "category";
  categoryEditWindow.setMenuBarVisibility(false);
  if (!electron.app.isPackaged && process.env["ELECTRON_RENDERER_URL"]) {
    categoryEditWindow.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}/category.html`);
  } else {
    categoryEditWindow.loadFile(path.join(__dirname, "../renderer/category.html"));
  }
  categoryEditWindow.on("ready-to-show", () => {
    console.log(`#### ready-to-show`);
    categoryEditWindow?.show();
    categoryEditWindow?.webContents.send(ED.CategoryEdit.Load, category);
  });
};
const closeCategoryEditWindow = () => {
  if (categoryEditWindow != null) {
    categoryEditWindow.close();
    categoryEditWindow = null;
  }
};
const icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAgAElEQVR4XuydBXRUxxfGvw3BXYq7FUgIVix4cXd3KU4plAKl1FtaWtzd3R2KtGhwSSC4u7tL9n/uUvqvBHbe27e7b3e/e05OaPPNnTu/95J3d97MHQtoJEACJEACJEACPkfA4nMj5oBJgARIgARIgATABIA3AQmQAAmQAAn4IAEmAD540TlkEiABEiABEmAC4OA9ULJkSf/bt6NFf/78bgxrzKjRo720xLBaX0aPiCLf/aJHiXgVw8Eu2JwESIAEfJLAK78oTy2WiGd+r6xPLRb/Z8/9rU8tT148ixYtwdNEiZ4/27hx40ufBGPQoJkAKIAMCioX+6XlQVY/+GWxRlizwmLJYoE1qxXIAiCxggtKSIAESIAEjCdwywKcsMJyHFbrCYuf5XgEIk74W+MeDwtb+8j47rzLIxOASK5nYGDBIPj5l7daIyrBYskKIKV3XXaOhgRIgAS8nsBlWK3HLRa/VYh4+duhQzvDvH7EGgfIBABA9nzFUkR5GVHcarWWAFAJQDqNHCknARIgARIwN4FzAFZZLJZNr/z9Nh/Zu+WKucN1fnQ+mwAE5A7ObY1ADQtQDMCHzkfNHkiABEiABExE4HcrsMXihyXhB0IOmCgul4XiUwlArlyFU720WqrDiuqwoJzLKLMjEiABEiAB8xKwYi0sWOpvsS4NDd1+ybyBGhuZ1ycA+fLli/r0RfTqFiuqWy2oDiCusQjpjQRIgARIwEsIPLBYsdRqwdIYUZ8t3bt37wsvGVekw/DaBCBnzqIZI/wiWsKKRgAyevNF5NhIgARIgAQMJ3AaFszyi/CbfPDg1tOGezeBQ69LAP58t9/SYkELWBHPBIwZAgmQAAmQgKcSsOC+1YopFj9M9ra1Al6TAGTPGVzczw/yib+Fp95njJsESIAESMDEBCyYEhGByUcOhmw2cZTKoXl8AhCYq3AVq9UiD/3ayqOmkARIgARIgAT0E1hosVinHArdvkK/C/e39NgEIDCweJoIvxd9LLC0dz9GRkACJEACJOBrBKywjvGLiNrv0KHNFzxx7B6ZAATkDP4IFvQBkN4ToTNmEiABEiABryFwFlb0Cz8YMt7TRuRRCUD2oEJ5/eAnD35O93vancZ4SYAESMC7CSyMQES/I2E79nnKMD0mAQgMKtLHCvnUb43tKXAZJwmQAAmQgC8RsDyyAP0OhW3r5wmjNn0CIJ/6LbD0t8BSxhOAMkYSIAESIAHfJmCFdb0V1l5mnw0wdQLw57v+nwEk8u3biaMnARIgARLwMAK3YUVvM68NMGUCkLlgwXjRnvjJp36u8PewO57hkgAJkAAJ/J+A7BR4HjOi18mdO++bjYvpEoCAXEVKwWqVT/0FzAaL8ZAACZAACZCADgK7YLH0Dg/d9oeOtk5rYqoEIEeu4E8tVsjD399pI6ZjEiABEiABEnA9gZdWC3ofDg0Z6PquI+/RNAlAQFDwEABdzQKGcZAACZAACZCAEwgMDQ8L+cQJfjW7NEUCEBAUPAtAQ83RswEJkAAJkAAJeB6B2eFhIXJSrVvN7QlAQFDwegCl3UqBnZMACZAACZCAawlsCA8Lcev2drcmAIFBwQetQKBrmbM3EiABEiABEnA/AQtw6FBYSE53ReK2BCAgKPgagKTuGjj7JQESIAESIAETELgeHhaSzB1xuCUBCAgKtrpjsOyTBEiABEiABMxIIDwsxOXPY5d3GBAUfApARjNeAMZEAiRAAiRAAm4icDo8LCSTK/t2aQIQGFRknRVWty56cCVc9kUCJEACJEACqgQssKw/FLatrKreUZ3LEoCAXMFjYUVbRwNmexIgARIgARLwWgIWjAsPDWnnivG5JAEIDAoeYAU+dcWA2AcJkAAJkAAJeDIBCzDwUFhID2ePwekJQI6g4B8tQB9nD4T+SYAESIAESMBbCFiBfofDQr5w5nicmgD8Wdt/gDMHQN8kQAIkQAIk4I0ErBb0cObZAU5LAP481W8tD/bxxtuSYyIBEiABEnABgZewWMo56xRBpyQAmQsWjBf9SZR1PNLXBbcHuyABEiABEvBmAruexXxV9uTOnfeNHqRTEoAcQYVHW2Bpb3Sw9EcCJEACJEACvkbACuuYw2HbOxg9bsMTgICcwR/BgnFGB0p/JEACJEACJOCzBKxoG34wZLyR4zc0AcgeVCivH/xk6j+RkUHSFwmQAAmQAAn4OIHbEYgoeyRsxz6jOBiaAOQIKrzOAgsr/Rl1deiHBEiABEiABP4kYIV1/eGw7YZVCjQsAQgMKtLHCuuPvFIkQAIkQAIkQALOIWCB5YtDYdv6GeHdkATg9dR/lM2ANbYRQdEHCZAACZAACZBAZAQsjyLwqrgRrwIMSQACgoIXAKjNi0UCJEACJEACJOB0AgvDw0LqONqLwwkAV/07egnYngRIgARIgAQ0EjBgV4BDCUBgYPE0Vr+XmwGk1xg65SRAAiRAAiRAAvoJnLVE+Bc/dGjzBb0uHEoAWPBHL3a2IwESIAESIAHHCDhaIEh3AhCYq3AVq9Wy3LHw2ZoESIAESIAESEAvAYvFWvVQ6PYVetrrTgC48E8PbrYhARIgARIgAUMJ6F4QqCsByJ4zuLifBZsMHQKdkQAJkAAJkAAJaCYQYUWJIwdDZD2eJtOVAATkCp4MK1po6oliEiABEiABEiAB4wlYMCU8NKSlVseaE4CA3MG5EYH9WjuingRIgARIgARIwEkE/JAn/EDIAS3eNScAOYKCh1qAj7V0Qi0JkAAJkAAJkIDzCFiBYYfDQrpq6UFTApAzZ9GMEX4R+2FFPC2dUEsCJEACJEACJOBEAhbc94vwy3Pw4NbTqr1oSgACcgV/Dyv6qjqnjgRIgARIgARIwEUELPghPDTkS9XelBOAfPnyRX36IvpRABlVnVNHAiRAAiRAAiTgMgKnY0R9lm3v3r0vVHpUTgACgoLl4IH5Kk6pIQESMC+BWAkSIHaiRIgaMyYe3b5t+3r57Jl5A2ZkJEACWgjUDQ8LkQP67JpyAhCYM3i61YImdj1SQAIkYBoCafPkRdZixZAiW3bETpTY9uC3+Pn9J75njx7h0e1btmTg2KZNOLN7J+5duWKacTAQEiABNQIWK2YcOhjSVEWtlADkylU41Uur5QiAuCpOqSEBEnAfgWylPkS6PHmRKbgI5NO+XrsQegBn9+7BmV27cP3kCb1u2I4ESMC1BB74W6zZQ0O3X7LXrVICEBAU3BHASHvO+HMSIAH3EciQvwDy16sP+dRvpL18/gy7583DnvlzITMFNBIgAdMT6BQeFjLKXpRqCUDO4N9gQTl7zvhzEiAB1xNImDo18tetj6DKVZza+c2zZ2yJQPjaNU7th85JgAQcJGDF2vCDIeXtebGbALDynz2E/DkJuI9A7mrVUaR5S8SMH99lQZzYugUbRgzDw5s3XdYnOyIBEtBIQKEyoN0EIEdQ8DcW4GuNXVNOAiTgZALlP+2BnBUrO7mXyN3fv3YNq3/5GbJOgEYCJGA+Albg28NhId+8KzK7CUBAUPBGACXMNzxGRAK+S6Dp6HFIliWL2wGsHTQAYatWuj0OBkACJPAfApvCw0JK6k4AAgOLp7H6vTxPsCRAAuYh0GP9H+YJBsDGMaOwZwFLhJjqojAYEgBgifBPe+jQ5gtvg/HOGYDAoMKtrbBMIEkSIAFzEGg0bCRS5shhjmD+FsWCXp/ZtgzSSIAEzEPAAmubQ2HbJ+pLAFj8xzxXkpH4PIEPO3VB3pq1TMthVtfOuBwebtr4GBgJ+BoBe0WB3jkDEBAUfBFAKl+DxvGSgNkIFGvVBgUbNXY4rHN79+Dx3bt4fO8uXjx9aisUFCt+AshWwsTp0jvk/8GNG1j0xee4cfqUQ37YmARIwDACl8LDQlJrngEIDCzygdXPutuwMOiIBEhAF4FMhQqj5g/9dLWVRqd37rCV9z2+eaPtof82S/5+NrxfogSyly6LOIkT6+rv1I7tWNy3j662bEQCJGA8AUuEJf+hQ9sifT/31hmAwKAifayw/mh8OPRIAiSghYA8/CUJ0GryMA5bsRzyXYvJw1+KCgVVrqorEZAEQGufWuKjlgRIQJ2ABZYvDoVti/QTxFsTgICchf+AxfLOLQTqIVBJAiSgh4DeT/+bx4/Frrlz9HT5V5tEadKgfI+eSBUQqMkPZwE04aKYBJxLwGrdGH5we6nIOnl7AhAULAcJpHRuZPROAiTwLgJ6Pv1P79gO144fNwxsuW6fai4zzFkAw/DTEQk4SuByeFhIpGv5Ik0AgoLKxX6Fhw8d7ZXtSYAE9BPIUKAgavf7WZODcY0b4v61q5raqIjLdP0EuatWV5HaNJwFUEZFIQk4nUAUxIkTFrb2Pyd5RZoA5MhVOI/Fatnn9KjYAQmQwFsJaN32t/qX/k49qKf+wMFIkyu38hVzVjKiHACFJEACNgJWizXv4dDt+/+NI9IEIDBXkXpWq3Uu2ZEACbiPQOupM5AwldouXDmgZ+k3Xzk1WK0zEnJg0P4li50aE52TAAnYJ2CxWOofCt02TykBCMgZ3BcWfG/fLRUkQALOIJAyRwAaDRuh7Hrup91ccjBP5c+/QPbSZZTiOrNrJxb26a2kpYgESMCJBKz4MvxgyA9qCUBQkamAtZkTw6FrEiCBdxAo1roNCjZUK/wjh/HIoTyusBTZsqPxiFHKXQ2uWA6vXrxQ1lNIAiTgDAKWaeFh25orJQCBQcHbrUAhZ4RBnyRAAvYJyKd/mQVQseXff4tjm+TQTteYlvMIFvTuibN7WE/MNVeGvZBA5AQswI5DYSH/KSYS6RqAgKDgmwD0lQLjFSABEnCYwEczZiN+8uRKfoZVrYznTx4raY0QlWzXAR/UrafkytkLE5WCoIgESOBWeFhIErszACVLlvS/cfs55+x4w5CAGwl0W70WUaJGtRvBhdADkPf/rjTZCSA7AlRsy8QJ2Dl7poqUGhIgAScSeC9RtKgbN258+fcu/jMDwBoATrwCdE0CCgRixouHTouWKiiBfYsX4feRw5W0RokSpU2LVpOmKrmTXQCyG4BGAiTgXgKR1QL4TwKQLVuBxFGi+csrABoJkIAbCCTJkAEtxk9S6vm3gb/i4OpVSlqjRDHixkXnxcuU3B3fshnLvv1aSUsRCZCA8wi8ev4yydGju269cwbg/TxFUvq/skoZYBoJkIAbCKQMCECjoWpbAOX4XTntz5Xm5++P7mvWKXV5du8eLOj1mZKWIhIgAecReBnFkurY/m2X35kA5MxZNGOEJYIHejvvOtAzCbyTQPwUKfDR9FlKlDaNG4vd8xw79Eepo7+J4iRJgvZz5is1u3XuLGQnwIMbN5T0FJEACTiHgJ/VL9PBg1tPvzMBCAwslN3q53fYOSHQKwmQgD0C/tGj45OVa+zJbD8/9NsarPm1v5LWKFHSTJnRbOx4ZXfy8N+7aAH2LlwAa0SEcjsKSYAEjCNgiYjIcejQjiPvTAB4DoBxwOmJBPQS6LJ0BaLHjm23+fVTJzGt3Ud2dUYKMhcpihrfai8UevXYUexduBBHfl9vZDj0RQIkoEAgsvMA/rMIMHtQkUJ+sG5X8EcJCZCAkwi0mjwVidKkVfI+tkE9PLjpuin2Uh07IV+tOkqxRSY6sW0rtk6cgFvnz+n2wYYkQALaCETAUvhI2LZ/LBj6TwIQGFiopNXP7w9trqkmARIwkoCWk/dW9/8Z4et+M7L7d/qS6X95DeCIPbx1C1IjIHyt2qsOR/piWxIgAcASEVHq0KEd/ygZygSAdwYJmJBA7mo1UObjrkqRndu7F/N79VDSOirKVupDVPniS0fd/NX+wPJlttmApw8fGOaTjkiABP5LgAkA7woS8BACWnYCyJBccfSuLE5sNHQ4kmbOYijFayeOY8ukCTi7m2cGGAqWzkjgbwSYAPB2IAEPIqDlNcCD69dtswC3L1xw2giDmzVHcLMWTvO/bepkbJ8+zWn+6ZgEfJkAEwBfvvocu8cRKNioMYq1aqMc96XwQ5jdtYuyXoswqHIVlOv2qZYmurRS1GjzhHG4eeaMrvZsRAIkEDkBJgC8M0jAgwgky5oVTUeN1RRx2MoVWDt4oKY2KuIe6123Lvje1atYO2gAzu3bqxIaNSRAAgoEmAAoQKKEBMxEQD51y6dvLRYybQpCpqkd1mPPb+K06dBy0hR7MsN//vLZM1sic3i9WslhwwOgQxLwMgJMALzsgnI43k9AzyyAUJGZAEkEZLudXstStBiqf/Od5uby0Jbqf3lr1kLUGDE0t/97g01jx2D3/LkO+WBjEiABbgPkPUACHklAzyyADFQe/mErl9uSAS2JQKZChRFUpSrkux6b3rEdrh0/jiQZMqJA/QbIUaasHjd/tdk1Z7ZtXQCNBEhAPwHOAOhnx5Yk4DYCemcB3gT89MF9nNm1C0f/+B2ndkRe5DNO4sS2Vw0ZChREimzZdY81sjUI+evWR4l27XX7fDOj4Yy1DQ4FxcYk4EEEmAB40MViqCTwdwIynf5hJ8dX+Ee8fInHd+/i8b27ePH0KWIlSIBY8RMgepw4DgO/cvQI5nbvhpfPn/3HV/p8H9iSgPcyZtLdz/HNm7Dsu290t2dDEvBlAkwAfPnqc+weT0ASAEkEzGgyyzClTWs8vHXzreHFTpgQJdp1cOiVwPn9+zHvs+5mRMCYSMDUBJgAmPryMDgSsE+gxnc/IHNwEftCFyumtGmFm2fV9u47+krAWVsdXYyM3ZGASwkwAXApbnZGAs4hULvfz7Z39WaxOd264uLBME3hyCuBkh06IUn69JravRH/PnIE9i1eqKstG5GALxJgAuCLV51j9koCuapURdlP3DsVLtX65vbojif37upiLMcdV/mir+6zBZZ81RcnQ7bp6puNSMDXCDAB8LUrzvF6NYGMBQuhcp++iB47tsvHGbp8GdYNHexwv7ESJkTN735Aiuw5dPnSM/ugqyM2IgEPJ8AEwMMvIMMngX8TSJYlK4q1+Qgype4Ke/Hkia0wj1GVBt/E3GDQEKQOyqVrCFM/ao0bZ07rastGJOArBJgA+MqV5jh9jkCuqtUgi+sSpEzptLFLhb/d8+bixulTTumjbv8BSJcvn2bft86fw4JePfHgxnXNbdmABHyFABMAX7nSHKdPEpBtdh/Uq29LBIy0y+Hhtk/9J7ZuMdJtpL6qff0tshYrrrmfc/v2YenXffH8yRPNbdmABHyBABMAX7jKHKPPE4iXLJltOj1NUBBS58yFhKlTa2Ly6sUL26r+i2GhuBD2+rsrrVSHTshXu47mLlkoSDMyNvAhAkwAfOhic6gk8IZAvGTJkSxLFiRMlRoJUqVCQttXasSIGxd3Ll3C3cuXcOfSRdy9JN8v4ULoAbfDK9m+Iz6oU1dzHFsnTcSOWTM0t2MDEvB2AkwAvP0Kc3wk4EUEqn75Nd4vUVLziBb07omze3ZrbscGJODNBJgAePPV5dhIwAsJNBo6AikDAjSN7PrJE5j3WQ9IeWIaCZDAawJMAHgnkAAJeBSBqDFioOWkKYiXNJmmuFkuWBMuin2AABMAH7jIHCIJeBuBxOnSocX4SbD4+WkamhwfLIkAjQRIgDMAvAdIgAQ8lICcfSBnIGgxeQUgrwLklQCNBHydAGcAfP0O4PhJwIMJSLGjsl27aRqBLAaURYE0EvB1AkwAfP0O4PhJwMMJlGzXAR/UradpFLItULYH0kjAlwkwAfDlq8+xk4AXEJB1AFIyOG2ePJpGw5MDNeGi2AsJMAHwwovKIZGArxFInvV91P1lAKLHiaM89CtHj2DOJ13x6uUL5TYUkoA3EWAC4E1Xk2MhAR8mEFS5Csp1+1QTgZBpUww/xVBTABSTgBsJMAFwI3x2TQIkYCwBWRAoCwNVTT79yyyAzAbQSMDXCDAB8LUrzvGSgBcTiBYrlu1VQIps2ZVHeTJkG2Q9AI0EfI0AEwBfu+IcLwl4OYE0QblsSYCfv7/ySNcNGYTQFcuV9RSSgDcQYALgDVeRYyABEvgHATk6WI4QVrX716/ZXgXIdxoJ+AoBJgC+cqU5ThLwMQKVen2OHGXLKY9aZgBkJoBGAr5CgAmAr1xpjpMEfIxAojRp0WjocMSIF0955KwNoIyKQi8gwATACy4ih0ACJBA5gQINGqF4m4+U8bA2gDIqCr2AABMAL7iIHAIJkEDkBKRKoMwCpMieQxkRawMoo6LQwwkwAfDwC8jwSYAE3k0gS7HiqP71t8qYnty7hxmdO+DelSvKbSgkAU8kwATAE68aYyYBEtBEQOuCwD0L5mPjmFGa+qCYBDyNABMAT7tijJcESEAzgfcyZETDocMhhYJU7NXLl5jZqQOunzqpIqeGBDySABMAj7xsDJoESEArgcJNmqFIi5bKzQ6uXoXfBv6qrKeQBDyNABMAT7tijJcESEAXAf9o0WyzAMmyZFVuP6d7V1wMC1PWU0gCnkSACYAnXS3GSgIk4BCBbKU+RJUvvlT2cWzTRiz/Xn0BobJjCknABASYAJjgIjAEEiAB1xGo+UM/ZCpUWLnDxX374NSO7cp6CknAUwgwAfCUK8U4SYAEDCEgD39JAlTt7O7dWPB5T1U5dSTgMQSYAHjMpWKgJEACRhHQOguwst8POPL7BqO6px8SMAUBJgCmuAwMggRIwJUEtM4CXD4cjlkfd3ZliOyLBJxOgAmA0xGzAxIgATMS0DoLIFsCZWsgjQS8hQATAG+5khwHCZCAJgJaZwEuhIZi7qefaOqDYhIwMwEmAGa+OoyNBEjAqQS0zgJwR4BTLwedu5gAEwAXA/el7qLGiIHE6dIjVsKEiBEnDqLHjoPo8j1O7H/8d9To0RElWjREiRoN/tGi/vld/jvq6//v728X24unT/H47l08uXfX9v3//773178f3b6Nhzdv4tGd23b9UeAbBLTOAhhVFyC4WXPET5ES8ZImhdy7L589s323fT17ipe2fz+z/dv28z//v/y/+9eu4u7ly75xgThKpxJgAuBUvL7h/M2DXh72SdKnsz305St+8uSmBBAR8cqWCPz968Gt//+31H9/9vChKWNnUMYT0DoLMLNzR1w5ekRXIAlTpcKHnbogQ4GCutq/aRTx6hVuX7iAOxcv2L7//9/n8fTBA4d8s7HvEGAC4DvX2pCRRosZC8myZn39lSUrkmfNioSp0xji20xO7l29gusnT9oOg7l19ixunjuL2+fPmylExmIQAa2zAPuXLsaG4cN09V6pdx/kKFNWV1vVRjIL9iYpuHn2DC6GheLaiROqzanzIQJMAHzoYusZaqwECZD+g/xIFZgTybJkQdLMWeAXJYoeVx7f5sn9+7h5+jRunTuLiwfDcGLbVrx68cLjx8UBALV+/AkZCxZSQvHs0SNMa9cG965eVdK/EcnvUZ2ff9HUxijx8ydPbImAnGsgsxdXjx21vVqg+TYBJgC+ff0jHX3cpEmR4YP8tge/fKkeoeprKO9duYKds2cibNVKXxu61403+4elUblPX+VxbZsyGdtnTFPWi7Bgw8Yo1rqNpjbOEkviKkns62TgmC0hkFdiNN8iwATAt673W0ebIGUqZChQ4K+HvsrCO6J7TSBk2hSETJtKHG4gkDJHAFIFBtpmqBKlSYN4yZLjzK6dOL5lM45sWK8poubjJuC9jJmU2ty5dAnT2rbGi2fPlPQiqj9wMNLkyq2sd7Xw+OZNkK9jmzfBGhHh6u7ZnxsIMAFwA3SzdBknSRLboSgy9SlfFj8/s4TmUXHcuXgRE1s09aiYPTFYmYmSB718pf7zof+ue1ZrYlagfgMU/6idMpp1QwYhdMVyZX257j0QVKmyst5dQlk/8CYZkDUwNO8lwATAe69tpCOLGS/e6wf+nw9+WcFPc5zA3E+74ULoAccd0cNfBGSL3JsHvnzKV/10/neE64cNxYFlS5SoxknyHlqMn4gYceMq6S+FH8Lsrl2UtCKSrX/BzVoo680gPBmy7a9k4OXz52YIiTEYSIAJgIEwzexK/qjlrlbd9hUncRIzh+qRsTEBcPyyySf8dPk+QPp8+WzfE6RI6bDTu5cvYUKzJsp+Snf+GHlq1FTWL/3mK5zYukVZ33LiZNsWWU8zWe8irwaObfwD104c97TwGe9bCDAB8PJbwz9a9L8e/AlSOv4H1ctx6R4eEwB96FLnDEK6fPmQJlcepM6ZU58TO620XJsU2XOg8fCRynHICYFyUqAWq9P/V6TP94GWJqbRWq1WhC5fhgPLl+HmmdOmiYuB6CPABEAfN49o9eYTf5L0GUwZr6xElqIlb75ePH0CmWa0fT17hldv/v38GSJevoK/VAWMJtUC///9zb+jxYhpqzgYO2FCRI0Z06Xj5RoAddyyUC91UC7bYrg0Qbkg61CcbVoSAImlxrffI3ORokphPX/yGJNaNMPDW7eU9G9Ef68EKLNztq84cV1+72oK+m9i+d09sHypLRmQNQM0zyTABMAzr9s7o5ate4UaN4F8unKXyQNcVkrLFOydSxdx95J8v/Tnw/6+7buz9iFLAiCJwOuEINFfiUH85Clg+0qRHHHfS2oYGq2LzQzr2EMcJc/6PjLIupMCBSCfsF1t8gpA7kNVy1q8BKp99Y2qHGsHD0TYyhXK+ncJZfeNJAPR3yQFfyYGb5IE2eUgFTbffDekUwecPH/8+PWMwIplkNcENM8iwATAs67XO6OVPxLy4P+gTj2XjurmmTO4fvIErp08YaueJw98s+8plmJGtj+ktqRA/qhKYvD/f0sBJBXjwz9ySkkzZUaGggWRsUAh2zY9d9nh9euw6ud+mrtvOmqsrdqlip3asR1ySJA77J8JQbK/EoNUOXPCz891BbukSJYkAvL14OYNd6BgnzoIMAHQAc2MTbKV+tD28Hf2dL8csnNu7x5bEZHXD/2TiHj50oxIHIpJdke8njFI/o/EQA4zEpMqcF8DTbcAACAASURBVAfXrMKlgwcd6sebGidJnx4ZCsiW0oKm2O/+4Pp1LPyiNyRB1Wr5atdFqQ4dlZtNbNHMVpffTGarkZBTtkzmtH2XVwzONjlwS2pihK5Y5uyu6N8AAkwADIDoThcy1V2sTVsElq/glDDk0BF52F86dBBnd++GbH2ikcAbAnIOhDzwZWtpurz5TANGpqPXDR2Ms3t264pJXh+1nDAZMePHV2q/cexo7Jk/T0nrLlHKHDkgSYG8hpHvcd97z2mh7F+6BJvGjrat56GZlwATAPNeG7uRyUriEu3a69ofbc/5md27bFt+5A+o1gVO9nzz555NQB6KWYoUReaixZDRwVPtjCQhn/SvHDmMc/v2GnJOg5bCPVIDQhYbepJJEbBMhYNtNUHiJE5seOhy9oAkRlJqmGZOAkwAzHld7EaVv25928PfSJPpO3noH930By6Hhxvpmr68gIA87OWhLw9/1U/Gzhy2vIK6fOSI7aEvX0avRpfx1ur3s/IQpndsh2vHPW+PvJzwmalwYVsiIN/lv40yWewrScChNauNckk/BhJgAmAgTFe4kin/Eu06GHqkqEzvy35mefjLYh4aCbwh8F6mTLYHfpYixSD/dqfJwTVX/nzgy4P/3pXLTg+n+dgJyuP2hgWhMhPwOhEItpUJN8r2LpyPjWNGQ+oI0MxDgAmAea6F3UikgliVL/oaNuUvD305MOX0zh12+6bAdwiYZYr/1vlzuBAaiouhB3ApPBwPblx3+UXQUr5XPv3LLIC3WIrs2ZG3Zm3ISYlG2Lm9e/H7qBG247Rp5iDABMAc18FuFPLwlwIlCVOntqt9l+DJ/Xu242uPbNjASl4OkfS+xu6e4redWR8aigthB2wPfjmi1t0msx4yC6BqWosOqfp1p05mBPLVrGUrz+yoycN/2XffMglwFKRB7ZkAGATSmW7k4d9s9FhbFTxH7OCa1dg9d7bh70odiYlt3UtA6h3IFlL5kpXhrrYbp0+9/pQfFmr7Lgmq2UzWAagudpSdAPLO2xtNdhrJjEDSzJkdGh6TAIfwGdqYCYChOI13Jg9/OUDEEZOte7vnzoGc7EUjASEgD/s3D37VokdGkJNz5s/s2Y1ze/bYPulL4SizmxzhKzsCVExqAUhNAG+1KFGj2pKAvLVqIW4S/dsImQSY4w5hAmCO6xBpFKmDgtBg0FDdEUqZzh0zp2PX3Dm6fbCh9xCQ6odvHvqyb99VJnXjZVup1JE4s2eXx5WMlTURrSZNVd75sKB3T931B1x1TRztR4pkFW3ZCtlLl9HtikmAbnSGNWQCYBhKYx0lzZQJzTS8e/x372f37sHWSRO4B9fYy+KR3hKlSYtspUrZHv7yb1fYiydPcGb3bpzds8v28H9ww7PLw2qpCbBngax4H+UKzG7vQw4ck0QgRtx4umJhEqALm2GNmAAYhtI4R5Jdt5o0Rfc7/+0zpmPblEnGBURPHklAPuW/+cQvn/6dbU8fPsTZ3a8f+FJASupKeItpqQlw8+wZTGnTyluGbncc8mGlSMvWurcNMgmwi9hpAiYATkOrz7Fk0nIeuZ7V/vKHZ/P4cdzWpw+917TKUbYcAsuVR9o8eZ0+JnmnL2tLTm7barvvvLmOhJaaAHO6f2Jb2OhLVrBhIxRp0Qp6ks3rp05iXo/utlNCaa4jwATAdazt9iS/OLV/6q+rpvqNM6ex7NuvIWfT03yPQPTYsRFQrgICypVHsixZnA5AFpae3LYNJ0O2+sw9p6UmwI5ZM7B10kSnXwezdSDrlsp27QZZvKzVDixbgvXD9K950tof9QATABPdBVLaV0r8ajUpkDKzcyc8vHVTa1PqPZyAnFYoD315+Mu/nWl3L1+2fdKXT/xyQJSvWeqgXGgwaIjSsK8eP4YZHY0t1a3UsQlE8vCv9tXXupKAlf1+sFUlpbmGABMA13C220va3HlQb8Agu7p/C6R4ytgGdfHs0SPNbdnAcwnIp/w3D3759O8sk8V8J/6c4peHv5wO6cvWZuoMJEiVSgnBzM4dcOWo+4sZKQVrsEhvEnD3ymXbq4D7164ZHBHdRUaACYBJ7os6/X+FnO6n1QaWKw15D0vzDQLyXl/e78t7fmfapUOHcPSP321T/J6+gt9ITuW6fYqgylWUXMpCXFmQ66umNwk4vG4tVvX/yVexuXTcTABcijvyzvLVqo1SHTtrjmRMg7p4eJPT/prBeWADOZglqEpV3SutVYcsB0Id3rAep7aHqDbxKZ3sqqjyxZdKY5ZDtmZ/8rGS1ltFepOAdUMGIXTFcm/FYppxMQFw86VImCo1GgwZBjnlT4t5Y81xLeP3Fa0rHvyP79yxPfTlYKhrJzzvOFtX3guxEiZE2xmz4R89ulK3U9u2xo3Tp5W03irSkwQ8vnsX8z7rjptnzngrFlOMiwmAmy+DrJjNVbWapiiWf/8tjm3aqKkNxZ5FwBUPfnnYy0NfHv6SBNDUCNT68SeoVlLcNG4Mds+bq+bYi1XCS7hpMVlzsuRrtdkWLX6p/T8BJgBuvBtkr7/sLVb9NCGhrvm1Pw79tsaNUbNrZxJwxYNfpvfloS/T/TTtBD6oUw8l23dQanhu317M76l2joCSQw8WFWneEoWbajsnYXHfPji1Y7sHj9rcoTMBcOP1KdqyNQo1bqIcgXxaW/nTj8p6Cj2HgLMf/C+ePoUsrjq8YR1kgR9NP4GkmbOg2Zhxyg4mtmjqM7US7EGp8/MvSP9Bfnuyv34uD39JAmjOIcAEwDlc7XqNGS+erdZ/3PfUTtSSKVqpLnb7wnm7vinwHALOfvDfu3IF4evX4vC6dbh7+ZLngDF5pJIASCKgYr8NGoCDq1aqSL1ekyxrVtT7ZSCix4mjPFbOAiij0ixkAqAZmTENPqhTFyXbd1R2tmH4MOxfulhZT6G5Cch2Ptn9kalwsFMCvXLkMMLXrcPh9Wshp0LSjCUgrwDkVYCKHVqzGmsG/KIi9QmNHCBU5uNPlMfKWQBlVJqFTAA0IzOmgZa64vwFMIa5Gby8lzGj7Tz1nBUrOSUceb8fvm4tjm/e5BT/dPqagJZFbbfPn8ekVs2J7m8EKvbqjYCy5ZWZcBZAGZUmIRMATbiMEUsFt4o9eys7k5WwsiKW5rkEYidKZHvwy6d+LYs+VUb86sUL2/v98PXrfO4AGhU+ztDINZTtgLItUMXkdEA5rIv2moC8Cmg6aqwyDtn1JLufaMYSYAJgLE8lb/V+Hah8Utu5vXsxvxdXESuBNaHI4udne+jLwz9esmSGRijH7cr0snzi59oQQ9EqOav65dd4v0RJJe26oYMRunyZktZXRFqqKkq108mtW/I+N/jmYAJgMFB77jLkL2A78U/VVvz4va0kK83zCOQoUxZ5a9VG8qzvGxr8s0cPcWDZUtsXy/QailaTM7m2HypW8JQkbTXL2/6Dr9ZZgK2TJ2LHzBmarhHF7ybABMDFd0ix1m1QsGFjpV7lxLU53boqaSkyDwHZ5iSf+jMUKGhoUDLVb3vwL1/KbWWGktXnLPn776PJyDFKje9euoQJzdW3/Co59QKRllmA6ydPYlr7j7xg1OYZAhMAF1+LhkOGI1VgoFKvq3/5GeFrf1PSUuR+ArItTB78ssbDaJO66PLwv3H6lNGu6c8BAm2mzUCClGqnA05q2Qy3L1xwoDfva5oiW3Y0HjFKeWBcDKiMSknIBEAJkzGiBClSos30mUrOrh47ihmd1KqNKTmkyGkE/KJEQYEGjVCwYSNEjRHD0H4kAZRP/FeOHDHUL50ZQ6Bir88RoHgy49rBAxG2coUxHXuRl4ZDhiFVYE6lEcnvg3wwohlDgAmAMRyVvASWr4AKn/VS0m4cMwp7FsxX0lLkPgKZixRFwQYNkSJ7DkODkFXP8on/QugBQ/3SmbEEclWpirKfdFdyykqekWMq0KAhirdpq8Tw/rVrGNe4gZKWIvsEmADYZ2SYonKfvsj+YWklf7O7dsGlcJZsVYLlBlGClCltn/qDKlU2tHfZxy8P/jO7dxnql86cQ0DLrN69q1cxvklD5wTiwV6TpM+AFhMmKY9AdgPcOndWWU/h2wkwAXDh3dFl6QpEjx3bbo/PHj7EyNo1EPHqlV0tBa4nIFv6CjZsiNiJEhvWuZwdv2/xIp7yaBhR1zmSh5c8xFRsQrPGuHv5sorUpzRazghY/Ut/hK/lgWhG3CBMAIygqOBD3nHJuy4VO71zJxZ9oV4oSMUnNY4TSJsnj+1Tf/p8Hzju7E8P8klm3+LFCF3BPeKGQXWxI3kFIK8CVExKAkvtBto/CWgpjX5g2RKsHzaUCA0gwATAAIgqLoq1+QgFGzRSkYL7XZUwuUwUK0EC24Nf/kgZZY9u37I9+PctWYQXT54Y5ZZ+3EAga7HiqPa1WpU6LmKL/AJp+YDEBdLG3eRMAIxj+U5PjYaNQMocAUq9zfvsU5zfv09JS5FzCcjCzQINGyFR6jSGdPTq+XPsW/L6wf/g+nVDfNKJewnIaz15vadidy5ehBwPTPsvgY4LFkOSbRUbUKaUiowaOwSYALjoFmk7aw7iJVUrBTu0aiV+KnTRdXlbN1K9Tx788unOKDu4epXtwX/jFPfyG8XULH4ajxiNFNmyKYUzrFoVPH/8SEnrS6KaP/SDHI+tYpNbtcCt8+dUpNS8gwATABfdHt3XroefXxS7vV0/eQLT2qttibHrjALNBCwWCwo3bWab8vePFk1z+8ganNi6xbbAj1v6DMFpSidFW7VGoUZqlf7mfdYd5/fvN+U43BmUlnUAS7/5CvJ7RXOMABMAx/gptY6dMBE6zF+opJWbWm5umusJpMubz/bwT50zyJDOJZnbNXcOz3IwhKa5naTJlRv1Bw5WCnLz+LG2+4L2TwIpAwLQaOgIJSxbJ03Ejlk8F0AJFmcAHMXkWPtkWbKi6Wi1oy9lD/j6YUMc65CtNRHwjxbd9uCXSn5G2Mtnz7Br7mzbH3n5N837CUSLFQsfL1upNFAebRs5Jqmt0WaaWqXUw+vXYdXP/ZR4U/R2ApwBcMHdkalwMGp+/6NST9umTsb26dOUtBQ5TiBjwUK2h7/UJDfC5ORGefDLp3+abxFoPXUGEqayfy7AvStXML6pMcmmNxGOGjMmui5fpTSka8ePY3rHdkpaipgAuPUeyFW1Gsp27aYUA+uFK2FyWBQ9ThwUbtLMsK19nO53+JJ4vIOqfb/C+yXVVqePqFUdT+/f9/gxGz0ASQAkEbBnL54+xdAqFe3J+HM7BDgD4IJbpGiLVijURG3rz+Ivv4CUg6U5j0CWYsUQ3KQ53suUyeFOON3vMEKvcVCgfkMU/0htAe+C3j1xds9urxm7UQORVwDyKkDFuBVQhdK7NUwAHGdo10OFHj0RWEEtW53RuQOuHj1q1ycF2gnESpgQwU2aIXf1GtobR9KC0/2GYPQaJ7KItO4vA5TGs3XSBOyYpfa+W8mhl4hkEaAsBlQxJgAqlJgAOE7JQQ9a6lyPa1Qf91kgxkHi/20uhzDJlH+itGkd9s3pfocReqWDGHHjofPipUpj426fyDHJTgrZUaFiTABUKDEBcJySgx5q9/sZGQoUVPIyuEJZvHr5UklLkX0CcZMmRXDTZshZ0fFT+zjdb5+3rys+mjEb8ZMnt4tBqkCObVTfrs7XBEwAXHvF+QrABby1LA6ShS2ywIXmOIEcZcqhSIsWiJ88hcPOToZsQ8i0qVzd7zBJ73ZQ/ZvvkKVoMaVBjqpbC4/v3FHS+oqICYBrrzQTABfwLt+9B3Iqnhs/pn5dPLx10wVReW8XUs2vRNv2+KBuPYcH+fzJY4RMnYI9C+Y77IsOvJ9AocZNULRla6WBLvric5zeuUNJ6ysiJgCuvdJMAFzAu1SHTshXu45ST6xxrYTpraKkmbPYHv7p8uZ1zBFg++MsdRlkzzGNBFQIyKs+eeWnYpJYhkyfqiL1GY1qAmCNiMDAcqV9houzBsoEwFlk/+a3SPOWtmIzKjarSydcPnJYRUrNvwjIyX3y8I8ZP75DbORd/7ZpU7Cb5Vod4uiLjWWnScf5i5SGfmr7diz+so+S1ldEjYYOR8qAQLvDff7kCYZVrWRXR8G7CTABcMEdkr9efduDScUWfN4TZ3dzf7AKqzcaP39/G998tWpraRap9szuXQiZNgVXjhxx2Bcd+CaB9nPmI06SJHYHf+/qVYxv0tCuzpcEbabOQAKFaoqP797BqDq1fAmNU8bKBMApWP/pNFeVqij7SXelnpb/8B2ObfxDSUsRkPz9bCjRtp3y1qG3MZOdFzIlu3M292bzvnKMgJT9lvLfKsZFv/+kJOcpyLkK9ozJkz1Caj9nAqDGySGV7EGv3Kevkg+WAlbCZBMFVaps++QvZX0dsXP79toe/pfCDznihm1JwEYguFlzBDdroURjRqcOuHqMhb8Elhy//cmq35S43Tp3DpNbqzFWcuijIiYALrjwWg4D2jRuDHbPm+uCqDy3C//o0W0P/jwOVvSzWq0IkcOXZkz3XBiM3HQEspX6EFW++FIprtW/9Ef42jVKWm8XxUuaDG1nqR2TfO34MUzvqPZa1du5OTI+JgCO0FNsq+Ws8N3z5mDTOLWjgxW79ypZyhw5bA//VIE5HRrXhdAD2DZ1Ci6GhTrkh41J4N8EkmbOjGZjxiuB4e/7/zElf/99NBk5RonbxYNhmNOtq5KWorcTYALggrtDVqV3WrhEqSfZeib7g2n/JSCnKsr7/mgx7b8jfBc/Oa5383gmWbzHnEPAP1p0fLJK7VM9f9//fw3eL1ESVb/8WumiHFy9Cr8N/FVJSxETALffAx3mL0LshAntxsHFLZEj+rBjZ+R1cJX//evXsHn8OMghPjQScCaBtjPnIF6yZHa74O/7/xFpWTuxYcQw7F+y2C5fCt5NgDMALrpD6v06EGnzqBWn4crg/18UqeVfpktX5VXVb7ucJ7dtxabx43Dn4gUXXXF248sEtBwAxt/313eKfPqXWQAVk+l/eQ1Ac4wAEwDH+Cm3/rBTZ+StqbZPnSuDX2NNE5QLpbt0RZIMGZQ5RyaUan7bp09zyAcbk4AWAh926oK8NdX2qfP3/TXZlhMnI3G69EqYh1WrguePHylpKXo7ASYALro7gipXQblunyr1xpXBgFT1k4d/1BgxlJhFJpKtQvKu/9SO7bp9sCEJ6CGQu1p1lPn4E6Wm/H1/janHerX6J/euXsH4Jo2U2FL0bgJMAFx0h6TMEYBGw0Yo9ebrK4O1lE5+G9DDG9bbHv4Pb/JgJaWbjiJDCaTNkwf1fh2k5NPXf98FknzylxkAFTuxbSuWfq22zVLFny9rmAC46OpLdSupcqVivroyOHrs2LZP/TnKlFXBFKkm4tUr20K/PQvm6fbBhiTgKIE4iZOg/Vy1EyR99ff974wDK1REhR49lbBLqW45mpvmOAEmAI4zVPbQbtZcyKI2e+aLK4OTZspse/inCrR/EMjb+ElFtU3jx+LCgQP2EPPnJOB0Aixrq4640ud9kKO0WuLPY5TVudpTMgGwR8jAn8sxoXJcqIqNrF0DT+7dU5F6vCZL0WK2h3+cxIl1jyV0xXLblP+zR1wYpBsiGxpKoMnI0bazKlTM13cCtJk+EwlSpFRBhVF1auLx3btKWoreTYAJgAvvEKlgJycDqtjaQQMQtkrtlYGKP7NqPqhTDyXbd3AovD9GjcTeRQsc8sHGJGA0gUq9+yi/zvLlnQCJ06VDy4lTlPDLNt6JLdSOVldy6OMiJgAuvAHS5c2Hur8MUOrx9K6dWNSnt5LWU0Xyqd+Rev4Pb93ChmFDIIuCaCRgNgKFGjdB0ZatlcJa/v23OLZpo5LW20RaTks98vsGrOz3g7chcNt4mAC4GH3XFauVt7aNqFkdTx/cd3GEzu8ueuw4qNizFzIXKaq7s8uHw7F+2FBcP3lCtw82JAFnEshavASqffWNUhcbx4zCngVqiwaVHHqQqHyPnshZoaJSxBvHjsae+VzgqwRLQcQEQAGSkRI5FliOB1axlT/9iCMb1qtIPUYj5VEr9uwNOSBJr0kp3/XDhuDpgwd6XbAdCTidQLIsWdF0tNqZE/LwlyTAF631lGlImDqN0tDnftoNcpAXzRgCTACM4ajsJVvJUqjS9ysl/dGNf2DFD98paT1B9F7GTJD3ou9lzKg73F1zZmHzBLWT1nR3woYkYACB2IkSo8M8tbUpMv0vrwF8zbSclCoJ/7hGDfD8yWNfw+S08TIBcBrayB3HSpAAHReoHWLx6sULjK5XxyteA6QOyoU6P/WHf/TouohbrVbbp/7Q5ct0tWcjEnAHgR7rfgcsFrtdXz58GLM+7mRX520CWSMhayVUTGb+Vvz4vYqUGkUCTAAUQRkpq/PTL0ifP7+SS294DZCpcDBqfv+j0ngjE927cgXrhw/BmV27dPtgQxJwB4H2c+YjTpIkdrt+cOMGxjasZ1fnbYLGw0chRfbsSsNa82t/HPpN7ZhlJYcUgQmAG26CfLXroFQHtWxf1gBIEuCplqNsOVTq9bnu8KWoj3zyv3X+nG4fbEgC7iKgpRbAgDKl3BWmW/qVV4LNx01Q6vvls2eY0KwxZOcPzTgCTACMY6nsScuNL7sAJrVs7pGFLwrUb4jiH7VV5vJvoWT78vCXX34aCXgigRrf/YDMwUWUQpcZAJkJ8BX7oG49lGynVgOE9f+dc1cwAXAOV7tem4wag+RZ37erE8GGEcOwf4naugElhy4QleveA0GVKuvuifW+daNjQxMRKNP1E+SuWl0pIlkDIGsBfMVq/9QfGfIXUBruuqGDuf5HiZQ2ERMAbbwMU5f4qB3y12+g5O/SoYOY/cnHSloziOoPHOzQNr91QwZBSvvSSMDTCRRu0hRFWrRSGoYvFQNKE5QL9QcNUeIiC4Bl+l/WAtGMJcAEwFieyt4k85UMWNUW9O6Js3t2q8rdplNd9BRZgPKLvuSrvji1PcRt8bNjEjCSQM4KlVC+x2dKLn2pGJCWGcLTO3di0RfeXRVV6QZxgogJgBOgqrpsNGwEUuYIUJIfWrMaawb8oqR1h8gvShR0/01/0aKHt25iyVdfQk70o5GAtxDQkuj7SjGghKlTo/m4ifCPFk3pMv82aAAO+sC5KEowDBYxATAYqBZ3eWvUwoeduyg1efH0Kaa0aQk5KthsFjVGDEiJY7127fhxLPm6r08tgNLLiu08i4CWBb++UgyoSIuWKNxE7UCfx3fvYFKrFnh63/tKopvhTmYC4MarEDN+ArSYMAmxEyZUimLzhHHYNWe2ktZVohhx4qLzEv3FeU7t2G6b9rdGRLgqZPZDAi4jEDN+fHRauESpP18oBhQtZkzbp//4KVIoMQldsQzrhgxW0lKknQATAO3MDG1RqmMn5KtVR8mnHHwzrb3+bXVKnWgQxUqYEB3nL9LQ4p/SsJUrsHbwQN3t2ZAEPIFA9zXr4OfvbzdUXygGlLtqNZTp2s0uizcCT1n7pDwgkwmZALj5gkgVLKmGpWpLv/kKJ7ZuUZU7TRc3aVK0mzVXt//t06dh29TJutuzIQl4CoG2M+dADsFSMW8vBtRo6AikDFBb93T1+DHM6NheBRs1OgkwAdAJzshmUiZXyuWq2LGNf2C5mw8ISpAyJdpMm6kSbqQa7unVjY4NPZCAlsW+w2tUxbOHDz1wlPZDzlK0GKp/o3642ZZJE7Bzlv6/M/YjooIJgAnuATkeWI4JVrUZnTq4bbV84nTp0HLiFNVQ/6OT9/0nQ7bpbs+GJOBpBGr+0A+ZChVWCntc44a4f818C32Vgrcjkoe/JAGqNqlVc9w+f15VTp0OAkwAdEAzuonFYkHz8ZOQJH16JddSIlcOxnC1Jc2UGc3G6j+Kd063rrh4MMzVYbM/EnArATkCO0eZskoxTGv3Ea6fOqmk9SSRTPvL9L+qHVy9Cr8N/FVVTp1OAkwAdIIzulmhxk1RtKVaxTDpe+6nn+BCaKjRYbzVX/Js2dBkxGjd/c3s3BFXjh7R3Z4NScBTCchWX9nyq2JzP+2GC6EHVKQepSnbtRtyVa2mHLOvlUVWBmOwkAmAwUD1ukuQMpVtS6BqcQxX7hlOFZgTDYcM0zs0TGv/Ea6f9L5PNbqBsKFPEdCy733J11/i5LatXsVH1gw1HzsBUWPGVBrX4fXrsOrnfkpaihwjwATAMX6Gti77SXfkqlJV2efCPr1xZtdOZb0eYcocOdBo2Eg9TW1tJrdugVvneJSvboBs6PEE8tWui1IdOiqNY/Uv/RG+1rvOvA9u1hzBzVoojV9E3joLogzAhUImAC6Eba+rpJkzo8nIMZCyuip2esd2LOrbR0WqSyMlO1tPma6rrTSa0KwJ7l6+pLs9G5KANxAILF8BFT7rpTSUP0aNxN5FC5S0niBKkj4DZBdEtFixlMJ15cymUkBeLmICYLILXLpLV+SpXkM5qmXffo3jWzYr61WFMePFQ6dFS1Xl/9GNbVgfD25c192eDUnAWwhkLlIUNb79Xmk43nYMdoUePRFYoaLS2EXEwj/KqAwRMgEwBKNxTiRjbjJqjPJagPMH9mNej+7GBfCnJ3n4SxKgx0bVrYXHd+7oaco2JOB1BNLkyg05IlvF5NO/zAJ4g2UsWAi1fvxJeShyCujiL79Q1lPoOAEmAI4zNNyDlvLA0vmq/j/h8Lq1hsXRatJUJEqbVpc/by5kogsIG/k8gaSZMqHZ2AlKHNy1xVcpOI2ier8ORNo8eZVbLerTG6edvKZJORgfETIBMOGFTpQmrW0WQA7OULErRw5jZpdOKlK7mgaDhyJ1ziC7usgEQypXwMtnz3S1ZSMS8FYCUgZYygGrmOwAkJ0Anm5aa/4f3fgHVri5wqmnM9cTPxMAPdRc0KZE2/bIX6++ck9rBvyCQ2v0H8krHVX/+ltkKVZcuc+/CweWK80T/XSRYyNvJxA9pBZrFQAAIABJREFUdmx0WbpCaZhSA0BWwXuyxYqfwLbwL0GqVMrDmN3tY1w6eFBZT6ExBJgAGMPRcC+yd1ZmAeS4XRU7t28v5vfsoSKNVKN1C+LfnQyrVhnPHz/W3TcbkoC3E/h07QZY/PzsDlOqAEo1QE+2Em3bIX+9BspDCFu1EmsHDVDWU2gcASYAxrE03FOx1h+hYMNGSn5fPn+OIZXKK2n/LSrSohUKN2mqq+3kVi1w6zz3+euCZ4JGUngqfoqUSJAihe27f/RoePrgge1AGvl+6dBByL1Fc4xA50VLEUNhUe29q1cxvklDxzpzY2t5fSivEVXt1YsXmNG5A26cOqXahDoDCTABMBCm0a7iJU1mmwWIlSCBXde3L5zHpJbN7er+LchbsxY+7NRFcztpML/XZzi3d4+utmzkPgJypoOsTM9cpIjtuz2Tvdnn9+/HyW1b8Ii7O+zhivTncnqmzOrZM0m8ZCGtp5qs+pfV/6q2Z8F8bByjfhy6ql/q1AgwAVDj5DaVahlRPQU0spX6EFW+0LfgSA4jkhXLNM8hkDZ3HuSpUVPTiWx/H939a9ewf8li7F+6mLMCGi9701FjkCzr+0qtBpQppaQzm0iqmMqrRFV7cu+e7dP/vStXVJtQZzABJgAGAzXaXZzEiVF/0FAktLOgZvn330KSAFVLmT0HavX7GTHiqq0x+LvfrZMnYcdM/RUCVWOkzhgC72XMhHy160Aq0hlhN06fwt6FC5gAaoBZb8AgSAKmYoPKl0HEq1cqUtNo4iROgoZDhyF+8hTKMXlb0SPlgZtIyATARBfjbaGky5MXdX8d+NZIw1auwNrBb//5vxvKKwV5+CdX/ETy9/a75szC5gn6jwT2ANxeFWL20mVQqkMnpddIWgd+9I/fseJHtQp3Wn17m15+3zIWKKg0LFnL42nrLuQ1orxOVLXrJ09gVtcu3DasCsxJOiYATgJrtNtkWbMiV+WqCKpc5S/XchDQ0Y0bNR8eUrXvV3i/pPZpxn2LFuL3UepnehvNgP60Efigbj2UbNdBWyONalkoOKKm+jGvGt17jbz6N98pv3oZWrUSXjx54jFjT5c3H+r+om0VvySOkkDS3EuACYB7+WvuPVqs2Ij73nuIePkCdy5pP2inWOs2KNiwseZ+tc4yaO6ADQwlkKlQYdT8wTVHqsr+bdnHTXs7gcp9+iL7h6WVEA2vXhXPHj1U0ppBJGWOVRaTvomVM0dmuGqvY2ACYJ5r4fRIclashPKffqa5HykzLOWGaZ5BwNFTHPWMcvf8udg0doyepj7RpnyPz5CzQiWlsY6sVR1P7t9X0rpbpPWoX6kUKlP/8gqA5n4CTADcfw1cEkGa3HlQu9/PyocMvQnqxJbNWPrt1y6JkZ04TiBKtGio9UM/yLSsq23DiGG2XQK0/xIo83FX5K6mdsrn6Lq1PGK7pZZDjt4Q4cI/c/12MAEw1/VwSjRST0AWISVJn16T/2snjmNRn8/x6M5tTe0odh+Boi1boVBjfUWdHI364a2bmP3Jx9zWFQnIku074IM69ZQQj2lQFw9v3lTSulOkdeqfC//cebUi75sJgPmuieER1fz+R2QqHKzJr0xBLvqiN64cOaKpHcXuI5AodRo0HjkK0WPHcVsQXCsSOfqirVqjUKMmStdlXOMGkJoLZjatU/8yFi78M98VZQJgvmtiaESyBUz2gGs1OZlLTuiieQ6B0p0/thX6cbct/LwXzuze5e4wTNW/lNqWktsqNqFZY9y9fFlF6haNnql/bzrm2C3QndQpEwAngTWDW3kYyENBq20ePw675s7W2ox6NxKInyIFPpo+y40R/L/rPfPnYePY0aaIxSxByMmecsKnik1q0Qy3L15QkbpFo3XqX843kBMO71+76pZ42enbCTAB8NK7I22ePKj36yDNozuwfCnWDx2iuR0buJeA1Ico1+1T9wbxZ+9SKXBq2zamiMUsQWhJxie3bolb586aJfR/xKG14I80Xv1Lf821Skw5eC8MigmAF15U/2jRUW/AQKTMEaBpdFJYaNEXn8NqtWpqR7H7CVT98mu8X6Kk+wP5M4Jxjerj/vXrponH3YEEVaqMct3VjuuW5EmSKLOZnoPDOPVvtqv4z3iYAJj7+uiKTsuK4zcd3Dp3zvbwv3eVB3Pogu7mRp0XL9N1roOzwl76zZc4sXWrs9x7nN8cZcqiUu8+SnFP79AOsgPHTJahQEHbNmItxql/LbTco2UC4B7uTus1a/ESqPbVN5r8v3j21Lbd70LoAU3tKDYHgWixYuHjZSvNEcyfUcgaAFkLQHtNQMvv5czOHXHlqHl238hBZLX69bd7INm/rzWn/s1/9zMBMP81Uo5QTuSSqf9EadIqtxEhj/bVhMt04njJkqPtTHMt2jywbAnWDxtqOlbuCkhLaeZZXTvjcni4u0L9T7/yyV9mALQYp/610HKflgmA+9gb3nOFz3ppPvKVlbkMvwwud5gsS1Y0HT3W5f2+q0PZBijbAWmvCWg5MGdO9664GBZmCnR6Fv3JFsZ5n33KVf+muILvDoIJgAdcJJUQ9awCP7ltK5Z8/aWKe2pMTCBFtuxoPGKUqSI8tT0Ei7/8wlQxuTOYtHnyot47jvT+e2xzunXFxYPuTwD0LPqTcSz5qi9OhmxzJ272rUiACYAiKDPLkqTPgHoDBmk6810W6Czo9RnuXLpo5qExNgUCMeLGQ+fFSxWUrpNwCvifrNPnz486P/2idAFmfdwJlw8fVtI6S6Rn0Z/EsmXiBOycPdNZYdGvwQSYABgM1B3uanz3AzIHF9HU9bLvvsHxzZs0taHYvAQkAZBEwCy2Z8F8bBxjrlkJd7LRsgZgRsf2uHr8mNvC1bvo78iG9Vj5049ui5sdayfABEA7M1O1KNCgIYq3aaspph2zZmDrpIma2lBsbgLyCkBeBZjFeDLgP69ElqLFUP2b75Quz9R2bXDjlPvqAOhZ9Hf91Eks6N0Tj+/cURojReYgwATAHNdBVxSpcwbZpv79okRRbn965w7bfn+adxEo/lFbFKjf0DSDmtiiKe5c5OulNxfk/ZKlULXvV0rXx52VAPUs+ot49QoLen+G8/v3K42PIvMQYAJgnmuhOZK6vwxEurx5lds9vHkD83t9Bin6Q/MuAuk/yI86P6u9Y3b2yOXY12nttc1KOTsmd/vPUboMKn2utihyYvOmblmbo3fR3+8jhmPfkkXuRsz+dRBgAqADmhmafFCnLkq276gplJX9fsCR3zdoakOxZxCIFis2Os5fCP/o0d0e8N6FC/DH6JFuj8NMAQSWrwDZpqti45s0hCzSdaXpXfQXumI51g3RfuaIK8fGvt5OgAmAB94dUuin4ZChiBk/gXL0u+bOwebx5torrhw8hUoE9CwGVXKsQfTy+XNIJTsz1rLXMAzDpVq26Y5tUA8Pbt4wPIa3OYyTODHqDxqqudLfuX17sahvH7x6/txlsbIjYwkwATCWp0u8VezZGwHlyiv3dXbPbtsCHZp3E5A1IQ0Gu7f63u75c7Fp7BjvBq1jdLmr1UCZj7sqtRxVt5ZLF9MFN2uO4GYtlGJ7I3p48ybm9ujGdR6aqJlPzATAfNfknRHJiW9y8puqPX/yBHO6fYzrJ0+qNqHOgwmU6tgZ+WrVdssIHt25g5mdO+D+tWtu6d/Mnco1kWujYiNqVsfTB/dVpA5rokSNio9mzIbMAmix+T17QGYAaJ5NgAmAB12/qDFjouHgYUiaObNy1FsmTcDOWSzMoQzMw4Vx30tqOw8iYarULh+J1P6XMwBo/yWQv159lGjbXgnNsGqV8fzxYyWto6L4KVLgo+mzNLlZM+AXHFqzWlMbis1JgAmAOa9LpFEVbdkahRo3UY744sGDtk//NN8ikCZXbtT9ZYCm7aGOEpIHgjwYaJETKNiwMYq1bqOEZ0il8pC1FK4wuVfqDxys3NXehfPxx2gWeFIGZnIhEwCTX6A34aUMCLB9+rf4+SlHvLBPb5zZtVNZ/0YorxlkS1D8FCnhHy0qzuzejbO7dyF83VrNvtjAPQS0/mF3JMrz+/fZDn+hvZ1A4abNUaS52nv2QeXLQPbWu8qaj5uI9zJmtNvdjdOnMbVta7s6CjyHABMAD7lWNX/oByknqmr7Fi/C7yOHq8r/0lXo0ROBFSpG2m7/0iXYMNy9i8w0D8iHGyTPlg1NRox2KoEtE8dj52xtU8hODcikzmX6X14D2DNrRAQGlittT2boz1UXAQ6uVJ4r/g0l735nTADcfw3sRpCrajWU7drNru6N4M6lS7ap/0e3byu3EaFKFbCjf/yOFT9+r8kvxe4jEDtRIlsBmnR51AtGqUa7+pf+CF+7RlXu07py3T6FbAW0Z7Jod1jVSvZkhv9cXgPIrNHbbGaXjrhy5Ijh/dKhewkwAXAvf7u9x0mSBI2GjUC8pMnsat8I9CzSSZAyJdpMU1ssKK8CVvf/STkeCt1LwD9aNFtyp/IAUon0xJbN2D1/Hi4fDleRUwPYygBLOWB79vjuHYyqU8uezPCfJ0ydBoWbNEWOMmX/4VuOdV4/fCgeXL9ueJ906H4CTADcfw3eGUHRVq1RqJH6wr9jmzZi+fffah6VlsNKxPnB1avw28BfNffDBu4jkCxrVuSqXFV3InD12FHsXbQQcuobTRsBOQpYjgS2Z1IBUCoBusvS5c2HeMmSIe5779mus8wm0ryXABMAE1/bBKlSocnI0YgRJ65SlI7s+ddTB/zA8mVYP1R9BbHSIChyOgHZ+iV/6N98xYj79vvr8d27OL55I45t2oQLoQecHpu3dtBo+EikzJ7D7vDknI7JrdUWC9p1RgEJ2CHABMDEt0ipDh2Rr3Zd5Qgd2fMvnw6bjtJeKnjvogX4YxTrvitfJBMKpQiM7PhIkCIFJDm4d+UK7l65gntXLuPhrVsmjNjzQmo5aQoSp01nN/Brx49heke1egF2nVFAAkwAPPMekG05TUaOgVTqUrErR4/YarA7Yo2GjUTKHPY/pfy7j80TxmPXHK4Ed4Q923o3gfZz5yNO4iR2B3nxYBjmdFMrGWzXGQUkwATAM++Bsp90R64qVZWDX/VzPxxev05ZH5lQa5nhv/tY82t/HPqNK8IdugBs7LUEuq5YjagxYtgdH8/tsIuIAgMJ8BWAgTCNcpUie3Y0Hq5ebevs3j1Y0OszQ7rXuujw750u7NMLZ3btMiQOOiEBbyHgFyUKuv+mtnDyxNYtWPrNV94ydI7D5ASYAJjwAlXs9TkCypZTjmzxl19AtusYZaU6dEK+2nV0uZvfqwfO7eUhIbrgsZFXEogZLx46LVqqNDZZeb/ypx+VtBSRgKMEmAA4StDg9mlz50G9AYOUverd9mevA9XCJZH5Wdy3D07t2G6vC/6cBHyCgJYDd8JWrcTaQQN8ggsH6X4CTADcfw3+EUG1r75B1uIllKOa070rLoaFKeu1CCv17vOfwiCq7Zd99w2Ob96kKqeOBLyWQNLMWdBszDil8e1bvBC/jxyhpKWIBBwlwATAUYIGts9YsBBq/aheYc8Vnxaqf/MdpEiQHlv10484zKIxetCxjRcR0HIwk5yrIOcr0EjAFQSYALiCsmIfWh62clyobPu7cfqUonf9MtUqZpH1INUCpWogjQR8lYDM6MnMnoptmTgBO2erleRW8UcNCbyLABMAk9wfUiVMqoWp2u75c7Fp7BhVucM6e4eFvKsDqSV+YOkSh2OgAxLwRAK5q1VHmY8/UQqd22mVMFFkEAEmAAaBdNRN6S5dkad6DSU3j+7cwczOHXD/2jUlvVEiR5KAjWNGY8+CeUaFQj8k4DEECjdtjiLN1cr7Lvi8J87u3u0xY2Ognk2ACYAJrp8cvtF83EREjx1bKZpdc2Zj8wS1RUVKDjWI6g8YjDS5335s6LtcOVKqWEOIlJKAqQiU7vwx8tSoqRTT1LZtXPJaTykYiryeABMAE1xiOe1PCvCo2tR2bXDjlPPf/b8tnto/9UeG/AVUw/2HbuesmZBEgEYCvkKgSt+vkE3hKGDhMapOTcgBTDQScAUBJgCuoPyOPvz8/dF83ASlg0LEjbP2/WvFUOPb75G5SFGtzWz6g6tW4jfuddbFjo08j0C9XwcibZ68dgOPePUKg8qXsaujgASMIsAEwCiSOv0Elq+ICp/1VG699OsvcWLbVmW9M4VaPtn8Ow6pXCgVDGkk4O0E5PWeHO5lzx7cuI6xDevbk/HnJGAYASYAhqHU50j104F4v3rsGGZ0MtdRoRV79UZA2fK6Bn/lyGHM7dEdL58909WejUjAEwh0mLcAsRMlthvq1aNHMaNzB7s6CkjAKAJMAIwiqcNP+vz5IXvsVW3jmFHYs2C+qtxlOkfKBsvZ83J+wN3Ll10WLzsiAVcSkIOA5EAge3YyZBuWfNXXnow/JwHDCDABMAyldkdaSu0+uX8PU9q0xqPbt7R35IIWH3bugrw1aunq6cXTp1jQuycuHTqoqz0bkYBZCcSIExedlyxTCi90xTKsGzJYSUsRCRhBgAmAERR1+IiXLDnazpyt3HL/ksXYMGKYst4dwhJt2yN/Pf3vMHl+gDuuGvt0JoGEqVOj9ZTpSl1smzoF26dPVdJSRAJGEGACYARFHT4CylVAxZ69lFvO6toFl8MPKevdJSzashUKNW6qu/vfRwzHviWLdLdnQxIwE4FUAYFoOHS4UkhrBw9E2MoVSlqKSMAIAkwAjKCow0eFz3ohsHwFpZZndu3Ewj69lbRmEMmrAHkloNfcWehIb8xsRwKREZD9/7JbRsV4jLYKJWqMJMAEwEiaGny1n7sAcRLbXxksLtcPG4IDy5Zq8O5+qRQKkoJBek3qHWwYPpRFUfQCZDtTEChQvyGKf9RWKZZp7T/C9ZMnlbQUkYARBJgAGEFRow8tx4O+fP4ME1s0w4Pr1zX24n550syZ0WyM/qNNZdujJAFXjh5x/2AYAQnoICCHAMlhQCo2omY1PH3wQEVKDQkYQoAJgCEYtTkJbtYcwc3UDgcxS+U/bSP8vzpBipRoPGIUYsaPr8vFk/v3bUnA0T9+19WejUjAnQRq/fgTMhYsZDeE508eY1jVynZ1FJCAkQSYABhJU9FX01FjkSxrViX16v4/IXzdWiWtWUXy8K/5/Y9ImSNAd4g8SEg3OjZ0I4EWEyYjSfr0diO4efYsprRpaVdHAQkYSYAJgJE0FXxp2f735N49TGzR1CumBaP4+6Nir8+RrdSHCpQil4StWmmbDXj14oVuH2xIAq4k0HX5KkSNGdNul6d37sSiLzxnoa/dAVHgEQSYALj4MgVVrgKpnKdih35bgzW/6l9Ip9KHqzVlP+mOXFWq6u72/P59WD98KG6fP6/bBxuSgCsIxIwXH50WLVHq6sDyZVg/lEWAlGBRZBgBJgCGoVRzVPOHfshUqLCSeOm3X+HEli1KWk8SlWjbDvnrNdAdspQPlpmA07t26vbBhiTgbALJsmRF09FjlbrZMmE8ds6ZpaSliASMIsAEwCiSin56rP9DSXnv6lVMatEUr16+VNJ7mqhAg4Yo3kZte9TbxmbWsxE87VowXucQyFK0GKp/852S85X9fsCR3zcoaSkiAaMIMAEwiqSCn+Tvv48mI8coKAFPKP2rNJB3iKRISukuXXXvEBDXB1evwh+jR+H540eOhsP2JGAogXy166JUh45KPmd37YJLHlDpU2kwFHkMASYALrxUuatWQ5mu3ZR6XPVzPxxev05J68miFNmyo/THXZE86/u6h3H58GFsHDMS8p1GAmYh8GHHzshbq7ZSOGMb1sODGzeUtBSRgFEEmAAYRVLBT/kePZGzQkUFJTC1bRvcOH1KSevpolgJEkAKpmQtXkL3UGQGQGYCZEaARgJmIFDj2x+QuUgRu6FYIyIwsFxpuzoKSMBoAkwAjCb6Dn/Nx03Eexkz2u1RqoFJVTBfM0cXBwqvPQvmQ9YG0EjA3QRaTpyMxOns1wC4d/UKxjdp5O5w2b8PEmAC4KKLHiVqVHRbrVbQ5/yB/ZjXo7uLIjNXN1I2VdYFWCwW3YGd3bPbNhtw69xZ3T7YkAQcJaC64PdC6AHM/VTt1aCjMbE9CfydABMAF90PWo4F9fVPsRkKFESZLl0RP0UK3VdH3qfKTICUUqaRgKsJyCd/mQFQMdYAUKFEjTMIMAFwBtVIfOarVRulOnZW6m1V/59w2MPL/yoN9B2iRGnTokyXT5A2Tx6HXIVMm4KQaVMd8sHGJKCVwPslSqLql18rNft95HDsW7xISUsRCRhJgAmAkTTf4avS532Qo3RZpd58aQHgu4D4R4uGUh06IVdVx9ZDnNu7B1unTMKVIzxVUOkGpMhhAloO/Jrf6zPIPUojAVcTYALgIuKtJk9DojRp7PYW8eoVBpUvY1fnSwJZF1CyXQf4R4+ue9gvnj3FtsmTbIsEaSTgbALy6V9mAVSMWwBVKFHjDAJMAJxB9V8+LX5++HStWpWvq8ePYUbH9i6IyrO6SJ0zCCXatYfUDXDETmzZbJsNuHXunCNu2JYE3klAdQcAjwHmjeROAkwAXEA/epw46LJkuVJPJ7dtxZKvv1TS+ppIOMpMQM6KlRwa+qM7t22zAXK6II0EnEFAdQfA1WNHMaNTB2eEQJ8kYJcAEwC7iBwXxE2aFO1mzVVyFLZyBdYOHqik9VWRVFeTRMAvShSHEMhpi9umTGIFNocosvG/CWjZARC+9jes/uVnQiQBtxBgAuAC7Fr+IOyYOR1bJ09yQVSe3UXa3HlQol0HJMuSxaGB3Ll00TYbcHSj2iFNDnXGxj5BQMsOAJ4C6BO3hGkHyQTABZcmRfYcaDx8pFJP3BKkhMkmihk/vm0mIKBcefVGb1HKNqyQqVPw9OEDh33RgW8T0LIDYMlXfXEyZJtvA+Po3UaACYAL0KfLlw91+w9Q6mnFD9/x06gSqf+LPqhbz5YIOGo3Tp/G9hnTcHzzJkddsb0PE9CyA2Bii2a4c/GCD9Pi0N1JgAmAC+hrORdcSgBLKWCaNgJSMKhoy9ZImSNAW8NI1KHLl9kSgYe3bjnsiw58j4Dqll8eAuR794bZRswEwAVXRKaoK/bsrdTTlDatcPPsGSUtRf8k4B8tOoq2aoUP6tRzGI2sDdg+fToOr1c7v8HhDunAKwhEjREDXVesVhrLzbNnMaVNSyUtRSTgDAJMAJxB9V8+89SoidKdP1bqaVSdmnh8966SlqLICcixwkVbtkKiNGkdRiSrtGU24O7lyw77ogPvJyD1KhoMHqo00CMb1mPlTz8qaSkiAWcQYALgDKr/8lmwYWMUa91GqacBZUop6Sh6N4E4iZOgaKvWCCxfwWFUcrCQJAGyRZNGAu8iIFtUP1Q88+OPUSOxd9ECAiUBtxFgAuAC9AUbNkKx1h8p9TS8elU8e/RQSUuRfQJBlavY1gbESpDAvtiO4timP2yvBfiKxmGUXuugYq/eCCirtitldtcuuBR+yGtZcGDmJ8AEwAXXKE/1GrYz7lVsXOMGuH/tmoqUGkUCSdJnsM0GZA4uotji7bIn9+/bZgP2LVrosC868D4CLcZPQpIMGZQGNqhCWUS8fKmkpYgEnEGACYAzqP7LZ46y5VCp1+dKPd2/fh0x4sa1aR/dvv3n1y3b99sXLuBUyDY8uHlDyRdF/yRQoEFD22yAoxUExevZPbuxc/YsXAg9QMwkYCMQxd8f3dasU6Jx/dRJTGunNiuo5NADRLJAMmPBQrbzPGInTow4f37JvwEL/9654RoyAXABdPnkWeO7HwzrSR46p3fuwPn9+3DtxAnD/PqCI1mkVaRFS6TJlduQ4e6ZPw8758zCk3v3DPFHJ55LQEvBr7BVK7B2kPeX/I6fIgXS5smL9Pk+UD4d8d93AP/eOe93ggmA89j+5VnK1tYbMMgpPUkJ2z3z5kJOEaSpEyjcpBmkYpuc1Oio3b5w3jYbIDsGaL5LQI6tLvPxJ0oA5OEvSYC3mjz489WsDVkUaaQd37LZ9vrt4sEwI936rC8mAE6+9DKdL1XqAitUdFpPr16+tCUBu+fPxdMHLGWrCjpVYE4EN20OqdRohEkFQZkNuHb8uBHu6MPDCJTv3gM5K1VWilqm/+U1gLeZTPPLQz9frdqIlSCh04Z3YNlS7Fu80PZalKafABMA/ezstpR3/4UaNkaitI7vR7fbGYDb589jx+yZOLyOxWtUeL3RyDbN4KbNECVaNC3NItW+fPYMO+fMxq45s/DqxQuH/dGB5xBoOnqc0uFUsvBPFgB6m8nfuwL1GigvgnR0/E8fPsS+RQsQMm2qo658tj0TACdd+lIdOiFf7TpO8v5ut3sXLsAfo9UOH3JLgCbsVN7fShKQoUBBQ6KTc97ltcCJrVsM8Ucn5ifQY73aiZKy9U+2AHqTufPv3antIVj85RfehNNlY2EC4ATUDQYNQeqgXE7wrO7yYlgo5nRXex+p7tX7lfnr1be9FogaM6Yhgz20ZrWt2IscNETzXgJaKgDK/SBFgLzFzPD3Top1zf7kY9y/dtVbsLpkHEwADMb88fJViGbQw8PR0J4/eYJhVSs56sbn2ifLmtWWBGQqHGzI2OW1wL4liyBHDj+8edMQn3RiLgIFGzVGsVZq1T6l/K+UAfYGM9PfO+H5v/bOAzyKaovjZ5YSIPTQEeklkEIvoVffU6o0QVCUhzQBedh7QcCniDRpIghIEVCRokKoQuglm0KRqvQWOgmEnfedCUFEktw7O7M7u/O/35dveS/nnnvu764z/9xy7rcv9qdT+/b5A1qP9AECwEDMz02fQUElSxno0X1XF44dpRm9ceGIHpK8hFP36Z6UPXduPdX/UYdf/iwCWAywKEDxHwIdR35CpWvVFurQtB7d6PJp3/9LtdvY8VS8SohQnz1pNL5da0q6ft2TTfpsWxAABg3dY8NeodB/W/Ov7ZjDERcrAAAgAElEQVSfV9Cvoz81qKf2csMbOGt37WbInQKp5Hg5YPeP35NzxXJ7wfTj3vINgLwDPqPCib6mdu+akZnlf1+vR0+q3+t5S8bJeQMWDBtqydisFhQEgAEj0ug/LxBnmXO33E5M1G4CvHk55TbA7HnyajnsRR4sGbW9bf482vDV1IzM8Ps0CFRo2Egb4yIVKxnGiB9UPCOAjYKGIfWKo2KVK1P3cWJr+vGRq2jFqBFeidOoRsMeb02t/jvMbXd8fPlGwkW6npBApKqGPu/4v6s1E8e7HaO/O4AAcHOEw9u0pZZD9KvNC38co4MbN5Lz5+V0+dSph0aTmk2rZLXqVKlpM90Rrxo7hqKX/qS7vt0rZsqSRZsNYCFghChL5ckCgB9YSCvsm9+wmp06U5N+A4SCX/n5Zz4981OsShXqPnaCUF8fZnRk+zYtg2l6WUyNet6tHj+Wdi/5UXesdqgIAeDGKGcOCKAeEybpOvd6bOdO2vbdPOJPmcJJa2p36aYrec35I0dozov9sf4sA/whtoXKlddEQKUmxl7dzEsCvDSAEwNuDpCHq7d97wPiGSKRMrNPbzp/xHdPhLR7/0Mq36ChSFf/ZnMiNlbb+7J/ndhRydTK7jzveJ8FH7e8dgEbb9MaMAgA6a/yXxVqde5Kjfv2k/aw8evptGXuHOl691eo272HdsOdbFk/ZbKWMRDFfQKVm7eg2k911yUA02odJwbcHxdPexiw6HuhrHd8odekLsamxvVkXyu3aEmPv/6mdJPefN7tXLyQ1k76Ujpmu1SAANA50rw+32PiJMpTpIiUhx/efpMObdksVSct47J161GH4XLriayK5wzsf2+fgSGB2NhJQGCgNhvASwNG3CuQivLahQvkXL6UnMuXEf8bxZoEZNb/+a/fpcM/tGZHMoiK82J0HzueCpYpKxW/t593HOz8oUNwd0AaowYBIPV1/suYL5KJeKaXVO3x7dtQ0rVrUnUyMg7ImZMG/bg0I7O//T5q1kykz5QilrFxscpVNCHANz8aWSAEjKRpvC+Z9X/+S5T/IvXFYpXnHe+94RMXMuVg1Cb68d23ZarYxhYCQOdQ80YY3hAjWn587x06uGmjqLmUXbn6Daj9Bx8J1zkZF0dzh7wobA9DcQIVmzSl6u07EF80ZGSBEDCSpnG+2rzznvA1t5yp7kRsjHGNe9CTlZ53nKir55dThHt/++ZNbemFE6Oh/J0ABICOb0S+4sWp9zfia/i7f/yBVk8Yp6Ml8SrNXxxM1dp3EK4w/dkelHDihLA9DOUIhLduS9U7dDA8MRSEgNw4mGnN0+J9Zs/VjupmVBKvXKFJXTrRnWTfuyBK9nnHy1Yrx4zOCIlbvw97ojW1Gip+FHHxm6/TkW1b3WrTHytDAOgY1eodnqRmA8Uu87h69izNfWkQ8aeZJVehQtT9i/HEnyKFz8jy0TMU8whwSuhq7Z8k/r4E5s9vaEMQAobi1OWMd8PzrniRcnjrVvr+rddFTC1nI/O84+BnD+jrkSuxeRaAZwNEyta539JvX38lYmorGwgAHcPdccQo4Vvj+C9/ngHwROEZAJ4JECmshlkVo5hPIHehQveEAOcSMLJACBhJU85Xi8EvUdW27YQq+fK+G5nnnSf++k8FLjMLcDwmhuYPFXs2Cg2onxhBAOgYSNFrP9n1lG5d6eo5c//6T+1CroKFqO888SN+n7Uw9hy7DpS2qlKobDltmcaMlNGpQiDml59Nn22y1aCl09ne38ymfMUfEcKxYNhL9Gd0tJCt1YxknndG7vrPiEO2XLnohbnzKWv2HBmZar/H8+6fmCAAhL46fxnlDAqifgsWCdU6e/AgzerXR8jWKKNnJk+jQuXKCbmb3LUTjpgJkTLW6NGq1TQhoCehSkaR8CmT+NWraG9kJJ3cG5+ROX6vk4BMRjzO8DmtZ3edLXm3mszzjkUoP1M8Wdq9/xGVb9BAqMnpvZ6hhON/CtnaxQgCQHKkZXageiMfNe9N4DU7keKptTqRWOxow9njeI9AifBwU7rPKYb52tkDv20wxb+dnfLVv3wFsEiJ/eVn+uWz/4mYWs5G5nnHacY53bgnC2fjbP32u0JNenJ2QiggCxhBAEgOgkzyHW9stJPZsIP/ICQH3yTzsMefoLDWbahIhYqmtHBq315NCMRHRlLi1SumtGE3pz0mTqYiFcXGa8WokRQfudInEVn9eceJiZ6dKra5b92USbRj4Xc+OQ5mBQ0BIElWZuPJsuEf0j7J3NeS4fzDXEYR81Ed3rSDYg0CvDeAxUDR4MqmBHT1/DltaYCXCPheCBR9BGT22rju3KFpPbrR1XPn9DXm5VpWf94F5stH/ReKnWby5AZFLw+bcPMQAMKoUgxlMmLxndSevuGtRHhV6jpabBrOl3cmSw6bT5lXafUY8ZWrxUNCzIlbVSmeZwRWr6Kj27eb04Yfe5W5AfTYrp208NWXfZaG1Z93DFZ0kyI/i/mZjPIXAQgAyW9DeOs21PKl/wrVWvrRB7R//TohW6OMKjZuQpydTKSs+uJzil4ml0ZYxC9sjCHAl6+EPv4ElQgzZ48AR/nHnt20N3KVNlN1OzHRmMD93MuTw0dSmbp1hXppxEU4Qg2ZZGT15x0nYRqwSOyYNd+2ydcxo0AA6P4OcK739h8OF6ofOW4s7fnJs/dRV23bnloMHiIUH+fH5jzZKNYmUKlpM21p4NFq1U0L9MqZM7R/w3o6sGEdndq717R2/MGx6F+c3Ne5QwbRybhYn+221Z93QSVL0XPTZwjx3TBtKm1bME/I1i5GmAGQHOmilYLp6Qli10t6Y4pdZsru2xcHEG8QQ/ENAhUaNdaWBkrVrGlqwLwssH/DOjqwYT0lXb9ualu+5jxXwYLUd57YRjI+csZHz3y5WP15J7PkueT9d4lPxqBgBkD3dyB3ocJa8gmR4o01J17/5/8oRMrU7k/RlbNnRExhYyECnD+AZwRK165jalTXzp+/NytwItZ3/4o1EpLM9b+8vMbLbL5cZJ53F44dpRm9n/Nod3m2k2c9Rco3L/Smc4cPi5jaxgYzAJJDnSlzFhr6i/iRni87PUk3LiVItqLPPEfefDRgkdiOWG5hzL9a+eTlJPro+F+tsvUiKOSxf5mSUOhBWsd27dKWB3hW4OYV+x4lzJ47Nw38fonQl2nZxx/RvrVrhGytaiT7vPPkxme+GrjPnHlClzEx3y+e+BclJyVZFbVX4oIA0IFd5q9sq94F4I3ZCR2oUUWAAB8b5A2DlZu3oICcOQVq6De5npCgiQAWA76a2lZ/71Nqdh83gYpVTv8q8DMHDmiX4vhDkXneefKoncwRxdP799Gcgf39YTgM7QMEgA6cMhvtrHoboDc2KOpAjSoSBHi6NrhFC00MBD1aUqKmPlPeP8KXSh3Zts1We0l441nbd99L96pnf8qxIfO842+SpzKMytwGuOXb2bRxxtf6vuh+XAsCQMfg5i9Rgp6fMUu4Jt8GyDMBZha+BZDzy4uWr597hi7+6d95sTmxTqFy5Slv0aJ07shhOr1vny3S4joyZUqZEWjR0tSTA/d/1+wmBlgE1OnWXWN8f7l08iStnzrZrzabyT7vPDELIPPXP4/PotdfpaM7kPPiwfcDBIDoG/MBu6fGjKVHQsOEa6+dNJF2Lha7REjY6V3DGh07UdP+A4WrHY9x0vyhYkcFhZ1azJCPavIRpgfLwU0bKXLcF7a5BKlUzVr3lgdIUTwySnYSAyWr16DchQsTnw44GR+v/dy64X8nJ2Sfd1vnz6XfvppmyvetXP0G1P6Dj4R9c36LSV06+eW4CENIwxACQCdBmeN2qU2YcfuezG1dqXF443iiTsy6qvFMCM+IpFUObdlMfA+CnUqB0mWoMi8PNG9JOQsU8FjX7SQGPAbVCw3ped6ZkWiM97gM+lEueRnnOuGcJyj/JAABoPNbkT1PXuoxcRLlKVJEysPUp58iTrpiROG/PF74VuxIYmp7l0+f1jbD3Lx8yYgQLOejdK3a1HHkJxnGZdeLkHgXe/DdDYNFKlbKkJORBqligDeg2nUDoZE8PekrS/bs1H3seOLLd2TKr6M/pZifV8hUSdNWz/OOnfFsJ896okAAGPodqNW5KzXu20/a56I3XnU7B3upWrWo00j5K0bXT5lM2xcukI7ZVyo07N1HW5vNqPBO9p8+fD8jM7/+PYslTi7EPwGBgR7t6+XTp+jPPXvoDxYDe/bQ1XNnPdo+GpMnwPsdHn9dfubMm8+7nYsX0tpJYonb5In4fg3MALgxhpkDAqjHhElUoHRpaS+8USZ6+VLi40Iyhe/nDn+iDfEmGNnCN8DNebG/X5+FlTmyNKtvHzp76KAsRr+z5yWBCg1ZCDSS2tdiFAjV5dLuJNBmBvbsoRM+nDrXKCZW88PJxWp26kyce0JPiVv5K8WtWkl/7N4lVd2d5x3Pds4bMoiuXTgv1aadjCEA3BxtmZvBHtYU39N+eOsW2rtmdbqRBDdrTmXq1KXg5i10R7xq7BiKXvqT7vq+UPFfr7ymJccRKdvmz6MNX00VMbWNTYmqVamiJgYaU458+bzS74TjxzUxkDI7sJuuX7zolTjQKGnZJvmCMdH/pjJiph0b3b6NYn/5hW7dvJGmuRHPu9Xjx9LuJZ69iyWj/lvt9xAABoxIq/++rKVmdackXr2i7SC+cenSvfV53mfAt11x+tFsuXK7457schOWzGalK2dO08z/PE+3bt50i60/Vua9AtryQMPGVLJGDa918c6tW/SnM5pO799PnMzl5N54upHgmcyaXuu0lxvmGSF+6Vds3FR79phVju7coY3l9YSLRKpKRj7v9q6JpOUjPjYrdL/xCwFg0FDKTD0b1KSwGztl/csZVID6LVgozObXzz+jmBXLhe3taMhZ73h5gAUBJxvydmEhwIKANxUedzqJ9xOguE+Ab5vUXvxNmlI2kzNKuh9t2h4u/vEHff38s2Y24Te+IQAMHMp+8xd69IiVSOh8ocvkpzqLmPqNTYfhI6hs3XpC/eEc9wtfHSZka3ejLNmyU/n6Dah0nTpUpk4dCgg0N+2wKG9OvsNi4ESMU9vtff7oUdGqtrcrWKYMPVq1GpVr0JBKhIX7BY8vOz+JWSLBkYQAEAQlajb4p2WUNYdnd1SnFRsnJBnXVn6zoGhfrWonc4c598GTF5hYlZlsXLw0xevDvC+lTO06xMfErFISr16lk/FxdO7wIe32N/7hm+pQiDJlyaK98EtUrUacxKhw+fJ+hWXeS4MIN1eKDykEgDgrYctOo/5HnIHNm4XTXnL6S7uWfgsWESdJEin+cG2rSD/NsmHOqWKAPzNnzWpWU7r9uu7cuSsGDtH5IymigAUC77nx95K3WHHteVS6Vi3tk0WAvxX+Y2dmn/8Q7+tBEScAASDOSsqyaf8BVKOjd6becfaVqH6v56lej55CY5Z0/Zq2GfDquXNC9jBKm0CuQoW0GQGeGWAxwPcSWLnwCYPUmQJeSuAXCB8f48/kW7esHPo/YlMcDi1RD0/raz+lU/7trdMcnoLHf+wsH/kx3bx82VNN+k07EAAmDqXMS8ioMDbPmU2bZuLWK74E6JnJ4kf8+AKX7d/5b4Iko75fMn7yFCmq7RUoXbuu9ulrhcXB/YLg8ukzlhAI2fPkoZz5g4jF1v0vfL6gyBvl5pUrtGPhd5Q1R3aq0+1pj4bACb1WjBpJybeSPNquvzQGAWDySPIxGr5O88Fbw4xuNj5yFe356UftKCFKCgFOCczZ7kSKP93fLtJfT9uwGHi0WjVt/Zl3mwfmz+/pEAxvj4+PJl27SolXr6V8XrtGvP8giT+v3f28+zuZo6ZZs2enwKAgjRG/6P/+7/zkyJTZ8L7odcgJzbYv/I4SjqfcLOpO4h6ZGPg+D+eypcSfKPoJQADoZydVkzfcVGvXnvgmKyML327HyS6O7dpppFu/8CV7ZeiS996h3zdt9Iu+W70TvDxQslp1TRTwbA2KbxE48NsG4pd/WlfsmiUE8OI39nsCAWAszwy9Fa0UTKVr19bWR/nfegpuWBOjxlOlz301Q3gNdN+6tbRs+IdizmFlGIF8xYtr/z2UqllbEwRW3ERoWGd92BEn7eGMpZxkh/MwiJTUseWZOB5jPQXPOz3UxOpAAIhxMsUqd+EiVLZePcpX/BFtui+Qp/u0z5TpUV6DTPm5oH0mnDhOhzZvxk5XidFo2n8g1ejYSbjGzD7PE9+ZgOI9AvyiSH1h8AsExbsE+GXPL31++buThTFr9hza865w+QrasgafHuEf/jeRguedF4YZAsAL0NGk5wgUqViRekycLNzglrlzaOPX04XtYWgugVwFCxJnIiwaXFn7NDM1rbk98T3vPM2/b81q4k8U/yQAAeCf44pe3Ueg7XsfUIWGjYSY8FEwngVITsKuYiFgXjBiEXC/KGCRgGIMAb6t7xj/7NwhPM1vTMvw4g0CEADeoI42PUqAX/4sAkQL7gcQJWUNO8wS6B8Hl+sOHdy4kY7s2K5d1Xv5FO5V0E/T92pCAPjemCFiHQR4GYCXA0QK30fP94ij+C6BAqVKUVCp0sSfBUqVpqBSpSj/IyV8t0MGRs5HFPmlzyde+KV/OzHRQO9w5UsEIAB8abQQq24CvBGQNwSKlqXDP6T969aKmsPOBwg4MmemAiVZEPxdHOQpWtQHotcXIucl4MuRLhw9Que1n6PEt4OigAATgADA98AWBDgdaq+p04WPBB7Zvo0Wv/GaLdjYvZOZAwK0WQIWAnzdce7Cd3/u/jsg0BqXe6U3TvxXfOoL/t7L/shRunbhvN2HF/1PhwAEAL4etiEgeySQBQALARR7E2ABoImCB8RBzgIFtCuRA3LmJLbJmiOHKaBUVaWr587S1bPn7n6epSv8v8+do6tn+fOsLS41MgWuzZ1CANj8C2Cn7nN2sp5fThHuMi8B8FIACgiIEODLeFIEQaD2me2uMEgRCCn/vys5me4kJwt93k68mfLSP49LqkT4w0aeAASAPDPU8GECj738KoX+69/CPeDNgLwpEAUEQAAE/I0ABIC/jSj6ky4BPj/efdwEYUoxK5YTHwtEAQEQAAF/IwAB4G8jiv5kSODx19+Uup1x7uAX6WR8XIZ+YQACIAACvkQAAsCXRguxGkKgRHhV6jp6jLAvzoG+fMRwYXsYggAIgIAvEIAA8IVRQoyGE2jzzntUsXETYb84ESCMCoYgAAI+QgACwEcGCmEaS6BUzZrUadSnwk4Pb9lC37/9hrA9DEEABEDA6gQgAKw+QojPNALtPxxO5SLqC/tHdkBhVDAEARDwAQIQAD4wSAjRHAJl69ajDsNHCDs/HuOk+UOHCNvDEARAAASsTAACwMqjg9hMJ/DEG29RcPMWwu2s/Pwzcq5YLmwPQ+sRyJQ5CwXmz0+BQUF0am+89QJERCDgIQIQAB4CjWasSYCzAz49biLxRTEiJeH4cZo3dDDdSEgQMYeNhQjkL/EohbduQ8HNmt+7EyLx6hWKj4ykNRPHWyhShAICniEAAeAZzmjFwgQa9+lLtbo+JRzhzsWLaO2kicL2MPQ+AU7L23HkJ1Q0uPJDg9m/fh0t/egD7weKCEDAgwQgADwIG01Zk0Bg/iB6evwEyl24iHCAC199mY7t2ilsD0PvEmj73gdUoWGjdIP47atptHX+XO8GitZBwIMEIAA8CBtNWZdA9Sc7UrMBLwoHyC9/FgEo1idQ48lO1HTAwAwDPX/kMM3s0ztDOxiAgL8QgADwl5FEP9wm0H3sBCpWpYqwH14G4OUAFOsSKFS2nJb1kW/kEymTu3aiaxcuiJjCBgR8ngAEgM8PITpgFIEKjRpT23ffF3bHGwF5QyBvDESxJoH2H3xE5eo3EA5u9oC+dObAAWF7GIKALxOAAPDl0UPshhNo8/a7VLFJU2G/cat+pZ8/GSVsD0PPERCd+r8/ogkd2hGfDEABATsQgACwwyijj8IEilSsSLwUIHoskB1HjvuC9vy0RLgNGJpPQHbqnyPauzqSlo/82Pzg0AIIWIQABIBFBgJhWIdAw959qE637sIBJV27Rt+9OgxTx8LEzDeUnfpXVZW+e3ko/RkdbX5waAEELEIAAsAiA4EwrEMgW+7c2ixA/hIlhIM6umM7LXr9VWF7GJpHQM/U/6aZM2jznFnmBQXPIGBBAhAAFhwUhOR9AmGPP0Gt/it3zG/z7Fm06ZsZ3g/exhHomfrHkU4bf2Fs3nUIAJt/AdD9tAl0HDGKSteuI4Xo+7feoMNbt0jVgbFxBGSn/u8kJ9N3w4bSibhY44KAJxDwEQIQAD4yUAjT8wQerVadunw6Wqrhc4cPa0sB1y/iLLkUOAOMGz7/H6rT/WkpT79Nn0Zb5yH7nxQ0GPsNAQgAvxlKdMQMAk369qeanbtIud63dg0t+/gjqTowdo9A5Zat6PHX3pBycmTbNlr85mtSdWAMAv5EAALAn0YTfTGcgCNTJur8yWdUompVKd/YVCaFyy3jIhUrUaeRnxBv3hQttxMTacHLQ+n0vn2iVWAHAn5HAALA74YUHTKaQJFKlTQREBAYKOX6pw/fpwMb1kvVgbEcgazZc1DHUZ9Q8SohUhXXT5lM2xcukKoDYxDwNwIQAP42ouiPKQTC27SllkOGSvm+evYsLXrjVbpw7JhUPRiLE3hs2CsU+u/HxSsQ0aHNUfTDO29J1YExCPgjAQgAfxxV9MkUAnwskI8HyhTkB5ChJWdbq0tXavxCP6lKSdev0YJh/6WzB3+XqgdjEPBHAhAA/jiq6JMpBLLlykWd//cZFS5fQco/UsxK4RIyLlu3HnUYPkLI9n6jlWNGk3P5Mul6qAAC/kgAAsAfRxV9Mo1Ayeo1NBEgW2J+XkG/jv5UthrsH0IgqGQp6vDRcMpbrLgUH766ma9wRgEBEEghAAGAbwIISBKo3qEjNRv4omQtot0//kCrJ4yTrocKfxEIKllSu7KZRYBMObp9u7YfAwUEQOAvAkICIDisfl0HqZsBDgRAIIVAi0FDqGq79tI41kycQLt+WCxdDxWIcuTNR11Hfy798r9y5gwtfuM1uvAHNmPiewQC9xNwkVJvr3PT31KXKg8iqhxer5qiKruADgRAIIUA5wfoOOITKlmjhjSSha+9Qsd27pCuZ+cKisNBvaZNl375M7Ml779Lv2/8zc740HcQeCgBVVGrx0dv3n3/L/8hAEJC6garDkc8GIIACPxFgKejO478hHIXKiyNZcEwvnp2j3Q9u1Z4bvoMXS//jV9Ppy1z59gVG/oNAukSUFyuyrGxW/amKwBCQxuUcSmuQ2AJAiDwdwLl6jcgvoBGT4EIEKOm9+UfH7mKVoySPykgFhWsQMD3CThUR9mYmI2H0xUAFavVL5b5jnrC97uLHoCA8QRqd32KGvXpq8sxRED62J6d+hUVLFNWmu2ZAwe0TX83L1+WrosKIGAXAsmZlOL7d286ma4AqFSpdlCmrJnP2wUK+gkCsgSaDRxE1Ts8KVtNs4cIeDi2bl+Mo+IhodJMOc8/b/o7HuOUrosKIGAnAnduJRfYt2/b364u/ccegLCwVoF36No1O4FBX0FAlkCbd96jio2byFbT7L9/6w06vPVvm3F1+fGHSllz5KBeX82g3IUK6erO8hHDae+a1brqohII2IlAJsqZ0+lceT3dGYAmTZpkPnfx1m07gUFfQUAPgafGjKNHQuX/auW2Isd+QXuWLtHTrN/UKVi2LD075Svd/Vn5+WhyrkCmP90AUdFWBArmz5pl3bp1yekKAP5llbAIXgIIshUddBYEdBDo/c0cyldcLktdajPbv5tP66dO0dGq71cpX78BtdO5oZJ7z1n+ONsfCgiAgBCBC3HOqAIPWv5jCYANQsIiNqtEdYXcwggEbE5g8NIVlDV7dl0UDm3ZTGu/nEiXTtpn323NTp2pSb8BunhxpY0zptOWb3HcTzdAVLQdAYVoS6wzqp6QAKgSVv8bIvUZ21FCh0FAJ4HBS5cT31evp1w6dZI2TJ1CB37boKe6T9VpPmgIVdORVTG1k1GzZlLUrG98qs8IFgS8T0CZFefc9KyYAAiNeJsU0nfg2fs9RQQg4BUCvWfOonyPlNDdNiex4WQ2/lhK1qhJ9Z7uSY+EhenuHl7+utGhot0JqPROXEzUcCEBEBJev4uqqgvszgz9BwFZAl1Hj6ES4VVlq92zP7JtK62fNoXOHzmi24eVKvIu/3o9elKtLk+5FRZe/m7hQ2WbE1AUpWts9KbvhAQA7gOw+bcF3XeLgDtHBLnh6xcv0saZX1PMiuVuxeHtyhUaNqK6T/ekQuXKuRUKXv5u4UNlEKCH3QPAWB66CRC5APCNAQH3CLgrArj1P/bspl0/fE8HN210LxgP185VoCDV7dGTwlu3cbvlxW++TjwrggICIKCfwMNyAKQpAPgXVcIieFtyMf1NoiYI2JvAY8NeodB/P+42hP3r12lC4ERsjNu+zHQQEBhIwc1aUM0uXShvUfceHQknTtC8lwbRjYQEM0OGbxCwA4GTcc6oh55VfugMgCYAQuutJUXRl+rMDkjRRxAQIFCn29PUsPd/BCwzNon95Wfat3YNHbXY9cIFSpeh4ObNtZe/3ox+9/eexc6aieMzBgILEACBjAmo6rq4mM1NH2aYpgAICav/ikrq/zL2DgsQAIH0CFRs0pSavziYcuTNawgovlqYhQCnwL1144YhPvU4KVOnLgU3b0HBzZrrqf7QOivHjCbncmT3MwwoHNmegELKq7HOTZ/KCYCQOmGqI1O07ekBAAgYQKBIhYrUbNBgKhZc2QBvKS6unD1DBzdtoiPbt3lsnbxIxYrapT28wU/P5T1pdZ6n/CPHjqFju3YaxgeOQAAEiBTXnfDY2K0PvS0rzRkABlclLOIoEZUERBAAAfcJZMuVi5r2H0hVWkdLBz8AAAwESURBVD3mvrMHPPAL9NDmKIpb9SudO3TIMP/ZcuWm0rVrU8lq1bUXfr5HHjHMd6qjw9u20urxY+nyqVOG+4ZDELA5gWNxzqhSaTHISAB8SUT9bQ4Q3QcBQwnwxsD6vZ6nnEHmXLeRePUKsSC4dOIEJZw4rv2bX67XLlyg6xcv0J3b/7zri5cnchYoQDmDCtz9DKLStetQ0UrBhvb9fmeqy0VRs7+hzbNnmdYGHIOAzQlMinNGpZl3O10BEBJev6uqqvNtDhDdBwHDCeQvUYLqP/sc8f4AT5ebV67Q9QsX6NbNG/de+I5MmTwaxrGdOyhq9izLn2zwKBQ0BgIGE1AU5anY6E1pJvVLVwAE12hY1HH7zkmDY4I7EACBuwSqte+gCQFeHrBDSU5K0v7i3zp/rh26iz6CgFcJuLJkKrZ3529prq2lKwA48iphEauJqJlXe4HGQcCPCRQqW45YCBiRM8DKmA5v3UKbZ39Dp/bts3KYiA0E/IXAmjhnVLpHdDIUAJXDIt5XiN7zFyLoBwhYlUDxkBCq2raddp7en0rS9evai3/HooX+1C30BQQsTUAl+iDeGfV+ekFmKACqVI2oSi7abemeIjgQ8CMCJavX0IRA+QYNfbpXV8+do/3r1lJ85Co6e+igT/cFwYOAzxFwULW4PVF73BIA2jJAaMSvpFArnwOAgEHAhwlwop3KLVpQpabGJdrxBA6+w4Bf/PvWrqWk69c80STaAAEQuJ+ASivjYqIyPG+c4QyAJgDCIvgYwUQQBgEQ8DwB3iPAGfdYDATmN+fooLu94hc9v/D5xc8CAAUEQMCrBAbGOaP4GH+6RUgAhIfXK56sKnuJyB5blTOiht+DgBcIZM+Thyo3b0mVmjajosHmnc+X6drJ+Hg68Nt67cXPU/4oIAACXidwNbOiBkdHb+YL/dwXAOwhJDRitqpQj4wc4vcgAALmEyhQqhSVrFGLSlavTrxnIFOWLOY3SkTnjx7Vzu7zz/GYGLpy5rRH2kUjIAACYgQUlebExkT1FLEWmgFgR1XCIjoREbbxilCFDQh4kIDicFDpWrWoRHhVCipZSvvJU6SIIRFcPn2a+PKhP6OjtU+88A3BCicgYCaBznHOqEUiDQgLgBo1amRJvB3AB3jLiDiGDQiAgPcIZMmW7Z4YyFusKPH/1n4CUj4zZ8tGDoeDbly6RDcuJdz9vEQ3Eu7796UEup2Y6L1OoGUQAAFZAoezZUmqtHPnzn/m+36IJ2EBoM0ChEd8RCq9LRsR7EEABEAABEAABEwmoNDwuOiod0RbkRIAoaENyrgcrt2kUm7RBmAHAiAAAiAAAiBgMgGFrjhcjmoxMRsPi7YkJQDYaeWwiLEK0WDRBmAHAiAAAiAAAiBgLgGVaFy8M2qITCvSAgCZAWXwwhYEQAAEQAAEPEBAIPPfg1FICwB2UCU8Ygap1MsDXUITIAACIAACIAAC6RFQaGZcdNRzspB0CYDg0IhGDoXWyzYGexAAARAAARAAAWMJuFRqvDcmaoOsV10CQJsFCIvgc4YdZRuEPQiAAAiAAAiAgGEEFsc5ozhPj3TRLQBCwuu1VlVlqXSLqAACIAACIAACIGAIAUVR28RGb16mx5luAcCNVQ6rN0khpZ+ehlEHBEAABEAABEBAPwGV1Mnxzs399XpwSwCEhDQqoTqSed2hlN4AUA8EQAAEQAAEQECawFHFlblRbOyGP6Vr3q3glgBgH1VCI/qQQlP1BoB6IAACIAACIAACkgRUeiEuJmqaZK2/mbstADQRgA2B7owB6oIACIAACICADAHdG//ub8QQARAcVre6gzJtIFIDZXoAWxAAARAAARAAARkCynUX3Wm017lll0yth9kaIgDYcUhY/TdVUj92NyDUBwEQAAEQAAEQeDgBhZS3Yp2bRhjBxzABwMFUDqu3SiGlhRGBwQcIgAAIgAAIgMBfBFRSI+Odm1saxcRQAZCyFOBYRUT5jQoQfkAABEAABEAABOiii1wtjZj6T2VpqABgpzgVgK8pCIAACIAACBhMwIBd/w9GZLgAuLsUgARBBo893IEACIAACNiTgLsJf9KiZooAKFenTu6Am5l4KaC2PYcLvQYBEAABEAABQwhsS8p+p+XBrVuvGOLtPiemCABtKSC8flNS1ZVElNnooOEPBEAABEAABGxAIJkUpVVc9Ka1ZvTVNAGgLQWERwxTVPrMjMDhEwRAAARAAAT8mYCq0Mvx0VGjzeqjqQJAmwkIi/iCiIaY1QH4BQEQAAEQAAE/JDA2zhn1kpn9Ml0A3BUBc4mom5kdgW8QAAEQAAEQ8BMC8+KcUd3N7otHBMBdERBJRM3N7hD8gwAIgAAIgIAPE1gd54zySEI9jwkAHoyQsIgYlSjEhwcGoYMACIAACICAKQQUothYZ1SoKc4f4tSjAuDuTMAZIirkqQ6iHRAAARAAARDwAQJn45xRhT0Zp8cFwF0RoHqyk2gLBEAABEAABKxMIM4Z5fH3sccbTB2AKmERh4iojJUHBLGBAAiAAAiAgMkEDsc5o8qa3MZD3XtNAHA0IWH1V6mkemSzgzfgok0QAAEQAAEQSIuAQkpkrHOTYbf7yZL2qgDQlgPCI6aQSi/IBg57EAABEAABEPBZAgpNjYuO6uvN+L0uAFJmAiI+U4mGeRME2gYBEAABEAABTxBQiEbHOqNe9kRb6bVhCQHAAVYOi/hYIXrT20DQPgiAAAiAAAiYRUAlGhHvjHrLLP8yfi0jADQRkHJ3wChcICQzhLAFARAAARDwAQLJqkKvm5nbX5aBpQQAB3/3FkEWAbhKWHY0YQ8CIAACIGBFAttIUV4361Y/vR22nADgjpSrUyd31puOTxRS+untGOqBAAiAAAiAgLcJqKROvpXd9drBrVuveDuWB9u3pABIDbJKaEQfUrQlgfxWA4d4QAAEQAAEQCAdAhdJpdfjYqKmWZWSpQUAQwsOq1tdIYVnA5AvwKrfIsQFAiAAAiBwj4BKaqRK6mt7nVt2WRmL5QVAKryQsPpvqtopATXQykARGwiAAAiAgF0JKNcVohGxzk0jfIGAzwiA1NkABzn4qGBHX4CLGEEABEAABGxDYLGLXCOs/lf//aPhUwIgNfC7ewNYCJSyzVcLHQUBEAABELAigaOk0ggrr/WnBc0nBQB3JiSkUQmX4/abOClgxf8eEBMIgAAI+D8B3uHvcGUZERu74U9f7K3PCoBU2CHh9VqrqtILywK++PVDzCAAAiDgkwQWK4o6MzZ68zKfjP5u0D4vAFLhB4dGNHI46DlSicUACgiAAAiAAAgYS0ChmS4XzdgbE7XBWMfe8eY3AiAVX5WqEVVVFz2nKNSLVMrtHaxoFQRAAARAwC8IKHRFVWmm4qAZcXui9vhFn/xtBuDBQQkNbVDG5XDxjEB3IirjT4OGvoAACIAACJhO4DApNNfhcsyIidl42PTWvNCA380APMiwRo0aWRJvB7RTVGqnKtSOiHJ5gTOaBAEQAAEQsD6Bq4pKS1SFlmTLkrRk586dt60fsv4I/V4A3I8mPLxe8WRVaUcqtSOFWunHhpogAAIgAAJ+Q0CllaTQksyKuiQ6evMJv+lXBh2xlQC4n8XdvQLtFaImRNTYLgOOfoIACIAACGgE1qtE6xQH/ehva/ui42tbAXA/IM4pQI7brUhVmqgKNSWi4qIAYQcCIAACIOATBE4oKq0lRV1HriwrffXsvpGkIQAeQjMkpH5NclArVXW1JEWpQETFjIQOXyAAAiAAAqYTOEmqekBRHKvIRStjYzftML1FH2sAAkBgwMLCWgUmK1crOMhRXnWpFUhRyiukVlCJyhNRkIALmIAACIAACBhP4IJC9LtKygFS1d8Vh3LARa7fM6u5DjidK68b35x/eYQAcHM8mzRpkvnixawBt25dyqZmzxKQNVnJpqrJAa5M/OkIyOS6k83NJlAdBEAABGxJ4I4jU6KiuJIcd9RERcmcdCuzmqjcvJ2UNWvexPz5byWtW7cu2ZZgDOo0BIBBIOEGBEAABEAABHyJAASAL40WYgUBEAABEAABgwhAABgEEm5AAARAAARAwJcIQAD40mghVhAAARAAARAwiMD/ATnhaBz5xSOGAAAAAElFTkSuQmCC";
let showDevTool = false;
let mainWindow = null;
const getmainWindow = () => {
  return mainWindow;
};
const createWindow = async () => {
  mainWindow = new electron.BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: false,
    // titleBarStyle: 'hidden',
    titleBarOverlay: {
      // color of titile bar
      color: "#3b3b3b",
      // color of titile bar control
      symbolColor: "#74b1be",
      // height of titile bar
      height: 32
    },
    // ...(process.platform === 'linux' ? { icon } : {}),
    ...process.platform === "linux" ? { icon } : {},
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });
  const menu = electron.Menu.buildFromTemplate([
    {
      label: electron.app.name,
      submenu: [
        { label: showDevTool ? "hide dev tool" : "show dev tool", click: () => toggleDevTool() },
        {
          click: () => {
            initDatabase();
          },
          label: "increment"
        },
        {
          click: () => {
            mainWindow?.webContents.send("update-counter", -1);
          },
          label: "decrement"
        },
        {
          click: () => {
            console.log("send request");
            mainWindow?.webContents.send(ED.CategoryList.ContextMenu.CreateRequest);
          },
          label: "test"
        }
      ]
    }
  ]);
  electron.Menu.setApplicationMenu(menu);
  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });
  mainWindow?.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  mainWindow.hide();
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow?.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow?.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  mainWindow?.webContents.on("did-finish-load", async () => {
    const categoryList = await selectAll();
    mainWindow?.webContents.send(ED.CategoryList.Load, categoryList);
    mainWindow?.show();
  });
};
const toggleDevTool = () => {
  if (null === mainWindow) {
    return;
  }
  if (showDevTool) {
    mainWindow.webContents.closeDevTools();
  } else {
    mainWindow.webContents.openDevTools();
  }
  showDevTool = !showDevTool;
};
electron.app.whenReady().then(async () => {
  createDataDir();
  await initDatabase();
  utils.electronApp.setAppUserModelId("com.electron");
  electron.app.on("browser-window-created", (_, window) => {
    utils.optimizer.watchWindowShortcuts(window);
  });
  registerEvent();
  toggleDevTool();
});
const registerEvent = async () => {
  electron.ipcMain.on(ED.CategoryList.ContextMenu.Show, (_, category) => {
    showContextMenu(category, categoryContextMenuCallback);
  });
  electron.ipcMain.handle(ED.CategoryEdit.Create, (_, category) => handleCategoryCreate(category));
  electron.ipcMain.handle(ED.CategoryEdit.Update, (_, category) => handleCategoryUpdate(category));
  electron.ipcMain.on(ED.CategoryEdit.Cancel, closeCategoryEditWindow);
  await createWindow();
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });
  electron.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      electron.app.quit();
    }
  });
};
const categoryContextMenuCallback = (category, mode) => {
  devLog(`categoryContextMenuCallback: ${category?.id}, ${mode}`);
  createCategoryEditWindow(getmainWindow(), category);
};
const handleCategoryCreate = (category) => {
  devLog(`handleCategoryCreate`);
  create(category);
  closeCategoryEditWindow();
};
const handleCategoryUpdate = (category) => {
  devLog(`handleCategoryUpdate`);
  update(category);
  closeCategoryEditWindow();
};
