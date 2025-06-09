(function (wp) {
  const { registerPlugin } = wp.plugins;
  const { PluginSidebar, PluginSidebarMoreMenuItem } = wp.editor;
  const { PanelBody, Button, TextareaControl, Spinner } = wp.components;
  const { createElement, useState } = wp.element;
  const { apiFetch } = wp;
  const { dispatch, select } = wp.data;

  const SmartWriteSidebar = () => {
    const [prompt, setPrompt] = useState("");
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);
    const [lastAction, setLastAction] = useState(""); // 'generate' or 'meta'
    const [copied, setCopied] = useState(false);

    const generateContent = () => {
      setLoading(true);
      setOutput("");
      setLastAction("generate");

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

    const suggestMetaDescription = () => {
      const title = select("core/editor").getEditedPostAttribute("title");
      if (!title) {
        setOutput("⚠️ Post title is empty.");
        return;
      }

      setLoading(true);
      setOutput("");
      setLastAction("meta");

      console.log("💡 Suggesting meta for:", title);

      apiFetch({
        path: "/smartwrite/v1/generate",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-WP-Nonce": SmartWriteBlockData.nonce,
        },
        body: JSON.stringify({
          prompt: `Write a compelling meta description for a blog post titled "${title}".`,
        }),
      })
        .then((res) => {
          if (res.success) {
            setOutput(res.data);
          } else {
            setOutput("Error: " + (res.data || "Unknown error."));
          }
        })
        .catch((err) => {
          console.error("❌ Meta Suggestion error:", err);
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

    const copyToClipboard = (text) => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          () => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          },
          () => alert("❌ Failed to copy.")
        );
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.top = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
          document.execCommand("copy");
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch (err) {
          alert("❌ Copy failed.");
        }
        document.body.removeChild(textarea);
      }
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
            __nextHasNoMarginBottom: true,
          }),
          createElement(
            "div",
            { style: { display: "flex", gap: "8px", marginTop: "10px" } },
            createElement(
              Button,
              {
                isPrimary: true,
                onClick: generateContent,
                disabled: loading || !prompt,
              },
              "Generate"
            )
          ),
          createElement(
            "div",
            { style: { marginTop: "10px" } },
            createElement(
              Button,
              {
                isSecondary: true,
                onClick: suggestMetaDescription,
                disabled: loading,
              },
              "Suggest Meta Description"
            )
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
              lastAction === "meta"
                ? createElement(
                    Button,
                    {
                      isSecondary: true,
                      onClick: () => copyToClipboard(output),
                    },
                    copied ? "Copied!" : "Copy Meta Description"
                  )
                : createElement(
                    Button,
                    {
                      isSecondary: true,
                      onClick: insertIntoEditor,
                    },
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
