package pb138;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.server.handler.AbstractHandler;

/**
 * Handles requests starting with "record/".
 */
public class RecordHandler extends AbstractHandler {
    private final LibraryEditor editor;
    
    public RecordHandler(LibraryEditor editor) {
        this.editor = editor;
    }
    
    @Override
    public void handle(String target,
            Request base,
            HttpServletRequest req,
            HttpServletResponse res
    ) throws IOException, ServletException {
        String[] params = target.split("/");
        
        boolean success;
        
        switch (req.getMethod()) {
            case "PUT":
                if (params.length != 3) {
                    success = false;
                    
                    break;
                }
                
                success = editor.addRecord(params[1], params[2]);
                
                break;
            case "PATCH":
                if (params.length != 4) {
                    success = false;
                    
                    break;
                }
                
                success = editor.changeRecordAttr(params[1], params[2], params[3]);
                break;
            case "DELETE":
                if (params.length != 2) {
                    success = false;
                    
                    break;
                }
                
                success = editor.removeRecord(params[1]);
                break;
            default:
                res.sendError(405);
                return;
        }
        
        if (success) {
            res.setStatus(200);
            base.setHandled(true);
        } else res.sendError(400);
    }
}
