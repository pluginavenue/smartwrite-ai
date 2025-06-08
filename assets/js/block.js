(function (wp) {
  const { registerBlockType } = wp.blocks;
  console.log("✅ Test block.js running");

  registerBlockType("smartwrite/test", {
    title: "SmartWrite Test Block",
    icon: "smiley",
    category: "widgets",
    edit() {
      return wp.element.createElement("p", {}, "✅ Hello from SmartWrite!");
    },
    save() {
      return null;
    },
  });
})(window.wp);
