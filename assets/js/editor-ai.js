jQuery(document).ready(function ($) {
  console.log("SmartWrite script loaded (Block Editor Only)");

  let latestOutput = "";
  let lastAction = ""; // 'generate' or 'meta'

  $("#smartwrite-generate").on("click", function () {
    console.log("Generate clicked");

    const prompt = $("#smartwrite-prompt").val().trim();
    if (!prompt) {
      alert("Please enter a prompt.");
      return;
    }

    $("#smartwrite-output").text("Generating...");
    $("#smartwrite-generate").prop("disabled", true);
    lastAction = "generate";

    $.post(smartwrite_ai.ajax_url, {
      action: "smartwrite_ai_generate",
      prompt: prompt,
      nonce: smartwrite_ai.nonce,
    })
      .done(function (response) {
        console.log("AJAX response:", response);
        if (response.success) {
          latestOutput = response.data;
          $("#smartwrite-output").text(latestOutput);
          showActionButton();
        } else {
          $("#smartwrite-output").text("Error: " + response.data);
        }
      })
      .fail(function () {
        console.error("AJAX call failed");
        $("#smartwrite-output").text("AJAX error");
      })
      .always(function () {
        $("#smartwrite-generate").prop("disabled", false);
      });
  });

  // ✅ Add "Suggest Meta Description" button below Generate
  if ($("#smartwrite-meta").length === 0) {
    const metaBtn = $("<button>", {
      id: "smartwrite-meta",
      class: "components-button is-secondary",
      text: "Suggest Meta Description",
      style: "margin-top: 10px; display: block;",
    });
    $("#smartwrite-generate").after(metaBtn);
  }

  $(document).on("click", "#smartwrite-meta", function () {
    console.log("Meta Description clicked");

    const title = wp.data.select("core/editor").getEditedPostAttribute("title");
    if (!title) {
      alert("Post title is empty.");
      return;
    }

    $("#smartwrite-output").text("Generating meta description...");
    $("#smartwrite-meta").prop("disabled", true);
    lastAction = "meta";

    $.post(smartwrite_ai.ajax_url, {
      action: "smartwrite_ai_generate",
      prompt: `Write a compelling meta description for a blog post titled "${title}".`,
      nonce: smartwrite_ai.nonce,
    })
      .done(function (response) {
        console.log("Meta description response:", response);
        if (response.success) {
          latestOutput = response.data;
          $("#smartwrite-output").text(latestOutput);
          showActionButton();
        } else {
          $("#smartwrite-output").text("Error: " + response.data);
        }
      })
      .fail(function () {
        console.error("Meta AJAX failed");
        $("#smartwrite-output").text("AJAX error");
      })
      .always(function () {
        $("#smartwrite-meta").prop("disabled", false);
      });
  });

  function showActionButton() {
    $("#smartwrite-insert, #smartwrite-copy").remove();

    if (lastAction === "meta") {
      const copyBtn = $("<button>", {
        id: "smartwrite-copy",
        class: "components-button is-primary",
        text: "Copy Meta Description",
        style: "margin-top: 10px; display: block;",
      });
      $("#smartwrite-output").after(copyBtn);
    } else {
      const insertBtn = $("<button>", {
        id: "smartwrite-insert",
        class: "components-button is-primary",
        text: "Insert into Editor",
        style: "margin-top: 10px; display: block;",
      });
      $("#smartwrite-output").after(insertBtn);
    }
  }

  $(document).on("click", "#smartwrite-insert", function () {
    console.log("Insert button clicked");

    if (!latestOutput) {
      console.warn("No latest output to insert");
      return;
    }

    if (
      typeof wp !== "undefined" &&
      wp.data &&
      wp.data.dispatch &&
      wp.blocks &&
      wp.blocks.createBlock
    ) {
      const block = wp.blocks.createBlock("core/paragraph", {
        content: latestOutput,
      });
      wp.data.dispatch("core/block-editor").insertBlocks(block);
    } else {
      console.warn("Block Editor not detected – cannot insert");
    }
  });

  $(document).on("click", "#smartwrite-copy", function () {
    console.log("Copy Meta Description clicked");

    if (!latestOutput) return;

    const btn = $("#smartwrite-copy");

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(latestOutput).then(
        () => {
          btn.text("Copied!");
          setTimeout(() => btn.text("Copy Meta Description"), 2000);
        },
        () => {
          btn.text("❌ Copy failed");
          setTimeout(() => btn.text("Copy Meta Description"), 2000);
        }
      );
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = latestOutput;
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        const success = document.execCommand("copy");
        btn.text(success ? "Copied!" : "❌ Copy failed");
      } catch (err) {
        btn.text("❌ Copy failed");
      }
      setTimeout(() => btn.text("Copy Meta Description"), 2000);
      document.body.removeChild(textarea);
    }
  });
});
