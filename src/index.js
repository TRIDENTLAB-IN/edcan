class Edcan {
  constructor() {
    this.default_height = 300
    this.default_bg = "#c9fffa";
    this.edit_data = []


    this.init();


  }

  init(){
    console.log('EditCanvas: Initializing...');
    const edcanElements = document.querySelectorAll('.edcan');
    edcanElements.forEach((elem, i) => {

      let uniq_id =Math.random().toString(36).substring(2, 9);
      //dose  element has id ? else lets grant one
      if(!elem.id){
        elem.id = uniq_id;
      }else{
        uniq_id = elem.id
      }
      console.log('UNIQ_ID = ',uniq_id);



      //if  size is set use that else  300x300
      let canvas_width = 300;
      let canvas_height = 300;
      if(elem.dataset.size){
        let canvas_size_array = elem.dataset.size.split("x");
        canvas_width = parseInt(canvas_size_array[0])
        canvas_height = parseInt(canvas_size_array[1])


      }
      let canvas = document.createElement('canvas');
      canvas.id = 'edc-'+uniq_id;
      canvas.width = canvas_width;
      canvas.height = canvas_height;
      //style
      canvas.style.width = canvas_width+"px";
      canvas.style.height = canvas_height+"px";
      canvas.style.backgroundColor = this.default_bg;
      canvas.style.display = 'block';


      // if the canvas  width > host div width then will resize the style
      let host_width = elem.clientWidth;
      if(host_width < canvas_width){
        let acx = host_width/canvas_width;
        canvas.style.width = host_width+"px";
        canvas.style.height = (canvas_height*acx)+"px";
      }else{
        let acx = canvas_width/host_width;
        canvas.style.width = (host_width*acx)+"px";
        canvas.style.height = canvas_height+"px";

      }
      canvas.addEventListener('dragover', (event) => {
                event.preventDefault();
                //add class to show  div
                console.log("file dragged over")
            });

            // 2. Clear visual feedback when drag leaves
      canvas.addEventListener('dragleave', () => {
                //remove those class
                console.log("file dragged OUT")
            });

      canvas.addEventListener('drop', (event) => {
              event.preventDefault();
              //clear  class  on canvas
              console.log("file dropped")

              // Get the file list
              const files = event.dataTransfer.files;

              if (files.length > 0) {
                  const file = files[0];
                  if(file.type.startsWith('image/')) {
                    this.handleImageDrop(uniq_id,file)
                  }else {
                      //update instruction to  drop image
                  }
              }
          }
        );

      canvas.addEventListener('mousedown',(event)=>{this.onPointerDown(event)});
      canvas.addEventListener('mouseup',(event)=>{this.onPointerUp(event)});
      canvas.addEventListener('mousemove', (event)=>{this.onPointerMove(event)});
      canvas.addEventListener( 'wheel',(event)=>{this.onMouseWheel(event)});



      elem.appendChild(canvas);
      this.edit_data[uniq_id]={}
      this.edit_data[uniq_id].canvas_width = canvas_width;
      this.edit_data[uniq_id].canvas_height = canvas_height;
      this.edit_data[uniq_id].active=false;
      this.edit_data[uniq_id].zoom = 1.001;
      this.edit_data[uniq_id].ratio=0.0;
      this.edit_data[uniq_id].x =0;
      this.edit_data[uniq_id].y =0;
      this.edit_data[uniq_id].drag_start_x =0;
      this.edit_data[uniq_id].drag_start_y =0;

    });


  }

  //read  dropped image and process
  handleImageDrop(uniq_id,file){

    let reader = new FileReader();
    reader.onload = (readerEvent) => {
      let dataUrl = readerEvent.target.result;
      let img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        this.edit_data[uniq_id].img =img;
        this.edit_data[uniq_id].x =0;
        this.edit_data[uniq_id].y =0;
        this.edit_data[uniq_id].ratio =(img.width/img.height);
        //calculate zoom for rendering
        this.edit_data[uniq_id].zoom = (img.width/this.edit_data[uniq_id].canvas_width);
        this.renderOnCanvas(uniq_id);
      }
    };
    reader.readAsDataURL(file);


  }

  // update canvas with image
  renderOnCanvas(uniq_id){
    let current_canvas = document.getElementById('edc-'+uniq_id);
    let current_ctx = current_canvas.getContext('2d');
    let source_img = this.edit_data[uniq_id].img;
    let pos_x = this.edit_data[uniq_id].x
    let pos_y = this.edit_data[uniq_id].y
    let zoom =this.edit_data[uniq_id].zoom
    console.log(current_ctx.canvas.width, source_img.width, current_ctx.canvas.height ,source_img.height)
    let ratio = Math.min(current_ctx.canvas.width / source_img.width, current_ctx.canvas.height / source_img.height);
    let newWidth = (source_img.width * ratio)*zoom;
    let newheight = (source_img.height * ratio)*zoom;
    console.log( pos_x,pos_y,newWidth,newheight);
    current_ctx.clearRect(0, 0,   current_ctx.canvas.width,  current_ctx.canvas.height);

    current_ctx.drawImage(source_img,pos_x,pos_y,newWidth,newheight);

  }


  onPointerUp(e){
    e.preventDefault()
    let elem_id = e.target.id.split("-")[1]
    this.edit_data[elem_id].active =false

  }

  onPointerDown(e){
    e.preventDefault()
    let elem_id = e.target.id.split("-")[1]
    this.edit_data[elem_id].active =true
    this.edit_data[elem_id].drag_start_x =(e.clientX/this.edit_data[elem_id].zoom)-this.edit_data[elem_id].x
    this.edit_data[elem_id].drag_start_y =(e.clientY/this.edit_data[elem_id].zoom)-this.edit_data[elem_id].y



  }
  onPointerMove(e){
    e.preventDefault()
    let elem_id = e.target.id.split("-")[1]
    if(this.edit_data[elem_id].active){
      this.edit_data[elem_id].x = (e.clientX/this.edit_data[elem_id].zoom) - this.edit_data[elem_id].drag_start_x
      this.edit_data[elem_id].y = (e.clientY/this.edit_data[elem_id].zoom) - this.edit_data[elem_id].drag_start_y


      this.renderOnCanvas(elem_id);

    }


  }
  onMouseWheel(e){
    e.preventDefault()
    console.log("mouse wheel")
    let elem_id = e.target.id.split("-")[1]
    console.log(  this.edit_data[elem_id]);

    if(e.deltaY < 0){
      this.edit_data[elem_id].zoom= this.edit_data[elem_id].zoom+0.005
    }else{
      this.edit_data[elem_id].zoom= this.edit_data[elem_id].zoom-0.005
    }
    this.renderOnCanvas(elem_id);

  }







}
