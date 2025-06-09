jQuery(document).ready(function ($) {
  console.log("SmartWrite script loaded (Block Editor Only)");

  let latestOutput = "";

  $("#smartwrite-generate").on("click", function () {
    console.log("Generate clicked");

    const prompt = $("#smartwrite-prompt").val().trim();
    if (!prompt) {
      alert("Please enter a prompt.");
      return;
    }

    $("#smartwrite-output").text("Generating...");
    $("#smartwrite-generate").prop("disabled", true);

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

          if ($("#smartwrite-insert").length === 0) {
            const insertBtn = $("<button>", {
              id: "smartwrite-insert",
              class: "components-button is-primary",
              text: "Insert into Editor",
              style: "margin-top: 10px; display: block;",
            });
            $("#smartwrite-output").after(insertBtn);
          }
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

  $(document).on("click", "#smartwrite-insert", function () {
    console.log("Insert button clicked");

    if (!latestOutput) {
      console.warn("No latest output to insert");
      return;
    }

    // === Block Editor (Force only)
    if (
      typeof wp !== "undefined" &&
      wp.data &&
      wp.data.dispatch &&
      wp.blocks &&
      wp.blocks.createBlock
    ) {
      console.log("✅ Forcing insertion into Block Editor");
      const block = wp.blocks.createBlock("core/paragraph", {
        content: latestOutput,
      });
      wp.data.dispatch("core/block-editor").insertBlocks(block);
    } else {
      console.warn("❌ Block Editor not detected – cannot insert");
    }
  });
});
