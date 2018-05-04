document.addEventListener('DOMContentLoaded', () => {
    //<Standard canvas management>////////////////////////
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext('2d');
    canvas.resize = function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    canvas.resize();
    window.addEventListener('resize', canvas.resize, false);
    
    




    (function draw() {
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        /*              Fade BG
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = '#FFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        */


        ctx.restore();
        window.requestAnimationFrame(draw);
    })();
})