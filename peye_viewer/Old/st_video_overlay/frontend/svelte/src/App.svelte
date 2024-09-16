<script>
  import { onMount } from "svelte";

  export let videoUrl = "";
  export let eyeData = [];

  onMount(() => {
    console.log("Component mounted");
  });
</script>

<div>
  <h1>Test Component</h1>
  <p>Video URL: {videoUrl}</p>
</div>
