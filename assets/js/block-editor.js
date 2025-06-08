(function (wp) {
  const { registerPlugin } = wp.plugins;
  const { PluginSidebar, PluginSidebarMoreMenuItem } = wp.editor;
  const { PanelBody, Button, TextareaControl, Spinner } = wp.components;
  const { createElement, useState } = wp.element;
  const { apiFetch } = wp;
  const { dispatch } = wp.data;

  const SmartWriteSidebar = () => {
    const [prompt, setPrompt] = useState("");
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);

    const generateContent = () => {
      setLoading(true);
      setOutput("");

      console.log("🧠 Sending prompt to SmartWrite:", prompt);

      apiFetch({
        path: "/smartwrite/v1/generate",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-WP-Nonce": SmartWriteBlockData.nonce,
        },
        body: JSON.stringify({ prompt }),
      })
        .then((res) => {
          console.log("✅ SmartWrite API response:", res);
          if (res.success) {
            setOutput(res.data);
          } else {
            setOutput("Error: " + (res.data || "Unknown error."));
          }
        })
        .catch((err) => {
          console.error("❌ SmartWrite fetch error:", err);
          setOutput("Error: " + err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    const insertIntoEditor = () => {
      if (!output) return;
      dispatch("core/block-editor").insertBlocks(
        wp.blocks.createBlock("core/paragraph", {
          content: output,
        })
      );
    };

    return createElement(
      wp.element.Fragment,
      null,
      createElement(
        PluginSidebarMoreMenuItem,
        { target: "smartwrite-sidebar" },
        "SmartWrite AI"
      ),
      createElement(
        PluginSidebar,
        { name: "smartwrite-sidebar", title: "SmartWrite AI" },
        createElement(
          PanelBody,
          { title: "Content Generator", initialOpen: true },
          createElement(TextareaControl, {
            label: "Prompt",
            value: prompt,
            onChange: (value) => setPrompt(value),
          }),
          createElement(
            Button,
            {
              isPrimary: true,
              onClick: generateContent,
              disabled: loading || !prompt,
              style: { marginTop: "10px" },
            },
            "Generate"
          ),
          loading && createElement(Spinner, null),
          output &&
            createElement(
              "div",
              { style: { marginTop: "15px" } },
              createElement(
                "div",
                {
                  style: {
                    whiteSpace: "pre-wrap",
                    background: "#f3f4f6",
                    padding: "10px",
                    borderRadius: "4px",
                    marginBottom: "10px",
                  },
                },
                output
              ),
              createElement(
                Button,
                { isSecondary: true, onClick: insertIntoEditor },
                "Insert into Editor"
              )
            )
        )
      )
    );
  };

  registerPlugin("smartwrite-sidebar", {
    render: SmartWriteSidebar,
    icon: "edit",
  });
})(window.wp);
