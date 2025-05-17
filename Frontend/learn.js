// ─────────────────────────────────────────────────────────────
// 🔔 Toast helpers (մի անգամ ամբողջ էջում) ───────────────────
if (typeof popup !== "function") {
  function createNotificationContainer() {
    const c = document.createElement("div");
    c.id = "notification-container";
    Object.assign(c.style, {
      position: "fixed", bottom: "20px", right: "20px", zIndex: 1000
    });
    document.body.appendChild(c);
  }

  function popup(success, msg, timeout = 3000) {
    let c = document.getElementById("notification-container");
    if (!c) createNotificationContainer(), (c = document.getElementById("notification-container"));

    const n = document.createElement("div");
    n.className = "notification " + (success ? "succ" : "err");
    n.textContent = msg;
    Object.assign(n.style, {
      color:"#fff", padding:"12px 16px", marginBottom:"10px", borderRadius:"8px",
      boxShadow:"0 2px 10px rgba(0,0,0,.2)", minWidth:"250px",
      background: success ? "#4caf50" : "#f44336",
      opacity:0, transform:"translateX(100%)", animation:"fadeIn .4s forwards"
    });
    c.appendChild(n);

    if (!document.getElementById("toast-keyframes")){
      const st=document.createElement("style"); st.id="toast-keyframes";
      st.textContent=`@keyframes fadeIn{to{opacity:1;transform:translateX(0);}}
                      @keyframes fadeOut{to{opacity:0;transform:translateX(100%);}}`;
      document.head.appendChild(st);
    }

    setTimeout(()=>{ n.style.animation="fadeOut .4s forwards";
      setTimeout(()=>n.remove(),400);
    },timeout);
  }
}
// ─────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", async () => {

  const BASE_URL = "https://localhost:7045";
  const email = localStorage.getItem("userEmail");

  if (!email) {
    popup(false, "Օգտվողը մուտքագրված չէ։");
    return;
  }

  const topics = {
    algorithms: [
      { id: "BubbleSort",      label: "Պղպջակային Սորտավորում" },
      { id: "QuickSort",       label: "Արագ Սորտավորում" },
      { id: "Dijkstra",        label: "Դեյկստրա" },
      { id: "InsertionSort",   label: "Ներդրմամբ Սորտավորում" }
    ],
    dataStructures: [
      { id: "LinkedList",        label: "Կապակցված Ցուցակ" },
      { id: "BinarySearchTree",  label: "Երկուական Որոնման Ծառ" },
      { id: "Stack",             label: "Ստեկ" }
    ]
  };

  try {
    const res = await fetch(`${BASE_URL}/api/dashboard/completed/${email}`);
    if (!res.ok) throw new Error("Failed to fetch completed topics.");

    const completed = await res.json();

    const calc = cat => {
      const all = topics[cat];
      const done = all.filter(t => completed.includes(t.id)).length;
      return { percent: Math.round(done / all.length * 100), done, total: all.length };
    };

    const { percent: algP, done: algD, total: algT } = calc("algorithms");
    const { percent: dsP,  done: dsD,  total: dsT  } = calc("dataStructures");

    document.querySelector(".options a:nth-child(1) .progress").style.width = `${algP}%`;
    document.querySelector(".options a:nth-child(1) .progress-stats").innerHTML =
      `<span>${algP}% ավարտված</span><span>${algD}/${algT} դասեր</span>`;

    document.querySelector(".options a:nth-child(2) .progress").style.width = `${dsP}%`;
    document.querySelector(".options a:nth-child(2) .progress-stats").innerHTML =
      `<span>${dsP}% ավարտված</span><span>${dsD}/${dsT} դասեր</span>`;

  } catch (err) {
    console.error(err);
    popup(false, "Չհաջողվեց բեռնել առաջընթացը․ փորձեք ավելի ուշ");
  }
});

