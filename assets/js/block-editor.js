(function (wp) {
  const { registerPlugin } = wp.plugins;
  const { PluginSidebar, PluginSidebarMoreMenuItem } = wp.editor;
  const { PluginDocumentSettingPanel } = wp.editPost;
  const { PanelBody, Button, TextareaControl, Spinner } = wp.components;
  const { createElement, useState } = wp.element;
  const { apiFetch } = wp;
  const { dispatch, select } = wp.data;

  const SmartWritePanel = () => {
    const [prompt, setPrompt] = useState("");
    window.smartwriteSetPrompt = setPrompt;
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);
    const [lastAction, setLastAction] = useState(""); // 'generate' or 'meta'
    const [copied, setCopied] = useState(false);
    const [insertNotice, setInsertNotice] = useState(false);

    // ✅ Listen for SmartWrite Pro prompt updates
    wp.element.useEffect(() => {
      const handler = (e) => {
        if (e.detail?.prompt) {
          setPrompt(e.detail.prompt);
        }
      };
      document.addEventListener("smartwrite-pro-update", handler);
      return () =>
        document.removeEventListener("smartwrite-pro-update", handler);
    }, []);
    const generateContent = () => {
      setLoading(true);
      setOutput("");
      setLastAction("generate");

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
          if (res.success) {
            setOutput(res.data);
          } else {
            setOutput("Error: " + (res.data || "Unknown error."));
          }
        })
        .catch((err) => {
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
          setOutput("Error: " + err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    const insertIntoEditor = () => {
      if (!output) return;

      try {
        dispatch("core/block-editor").insertBlocks(
          wp.blocks.createBlock("core/paragraph", {
            content: output,
          })
        );
        setInsertNotice(true);
        setTimeout(() => setInsertNotice(false), 2000);
      } catch (err) {
        console.error("Insert failed:", err);
      }
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

    const content = createElement(
      "div",
      null,

      createElement(
        PanelBody,
        { title: "SmartWrite AI", initialOpen: true },

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
                ),
            insertNotice &&
              createElement(
                "div",
                { className: "smartwrite-notice" },
                "✅ Content inserted into editor!"
              )
          )
      ),

      // 🔌 Pro UI mount point (outside PanelBody)
      createElement("div", { id: "smartwrite-pro-ui" })
    );

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
        content
      ),
      createElement(
        PluginDocumentSettingPanel,
        {
          name: "smartwrite-main",
          title: "SmartWrite AI",
          icon: "edit",
        },
        content
      )
    );
  };

  registerPlugin("smartwrite-sidebar", {
    render: SmartWritePanel,
    icon: "edit",
  });
})(window.wp);
